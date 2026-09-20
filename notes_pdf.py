"""In-memory, escaped HTML-to-PDF notes. No external assets or uploaded pages."""
from html import escape
from io import BytesIO
import re
import pymupdf
from agent import Lesson

def text(value):
    value = str(value)
    value = re.sub(r"\$([^$\n]+)\$", r"\1", value)
    value = re.sub(r"\\(?:mathrm|text)\{([^{}]*)\}", r"\1", value)
    value = re.sub(r"_\{([0-9]+)\}|_([0-9]+)", lambda m: (m[1] or m[2]).translate(str.maketrans('0123456789','₀₁₂₃₄₅₆₇₈₉')), value)
    value = re.sub(r"\^\{([0-9]+)\}|\^([0-9]+)", lambda m: (m[1] or m[2]).translate(str.maketrans('0123456789','⁰¹²³⁴⁵⁶⁷⁸⁹')), value)
    return escape(value.replace(r'\rightarrow', '→').replace(r'\times', '×'))

def export_notes(payload):
    if not isinstance(payload, dict):
        raise ValueError('Expected lesson notes.')
    # Migrate legacy sample/notebook glossary shapes at the API boundary.
    payload = dict(payload)
    payload['glossary'] = [dict(term=x.get('term') or str(x.get('quote','')).split(',')[0][:120],
        definition=x.get('definition') or x.get('explanation','')) for x in payload.get('glossary',[]) if isinstance(x,dict)]
    lesson = Lesson.model_validate(payload)
    if lesson.status != 'ready':
        raise ValueError('Generate a complete lesson before downloading notes.')
    headings = lesson.headings or ['Explanation','Key points','Key terms','Source evidence']
    def points(items):
        return '<ul>'+''.join('<li>'+text(x)+'</li>' for x in items)+'</ul>'
    body = '<header><p>PAGEBHASHA | REVISION NOTES</p><h1>'+text(lesson.title)+'</h1><p>'+text(payload.get('language',''))+' | '+text(payload.get('level',''))+'</p></header>'
    body += '<p class="summary">'+text(lesson.summary)+'</p>'
    body += '<h2>'+text(headings[0])+'</h2>'+points(lesson.explanation)
    body += '<h2>'+text(headings[1])+'</h2>'+points(lesson.takeaways)
    if lesson.revision:
        r=lesson.revision
        body += '<section><h2>'+text(r.title)+'</h2>'+points(r.key_points)+'<p class="remember">'+text(r.remember)+'</p></section>'
        if r.diagram:
            body += '<h2>'+text(r.diagram.title)+'</h2><ol>'+''.join('<li>'+text(s)+'</li>' for s in r.diagram.steps)+'</ol><p>'+text(r.diagram.caption)+'</p>'
        body += points(r.recall)
    body += '<h2>'+text(headings[2])+'</h2>'+''.join('<p><b>'+text(x.term)+'</b><br>'+text(x.definition)+'</p>' for x in lesson.glossary)
    body += '<h2>'+text(headings[3])+'</h2>'+''.join('<blockquote>'+text(x.quote)+'<p>'+text(x.explanation)+'</p></blockquote>' for x in lesson.evidence)
    body += '<footer>Saved for offline study. AI explanations may contain mistakes. Compare with your textbook.</footer>'
    css = 'body{font-family:sans-serif;font-size:11pt;line-height:1.55;color:#203c32}header{background:#244b3e;color:#fff;padding:20pt}h1{font-size:25pt}h2{font-size:15pt;margin-top:20pt;page-break-after:avoid}li{margin-bottom:7pt}blockquote,.remember{background:#eef1e3;padding:12pt}footer{font-size:9pt;color:#52644f;margin-top:22pt}b{font-weight:bold}'
    stream=BytesIO()
    writer=pymupdf.DocumentWriter(stream)
    story=pymupdf.Story(html='<html><body>'+body+'</body></html>', user_css=css)
    page=pymupdf.paper_rect('a4');frame=page+(40,40,-40,-40)
    # Story uses MuPDF's embedded fallback fonts and script shaping; no network font fetch.
    for _ in range(40):
        device=writer.begin_page(page)
        more,_=story.place(frame)
        story.draw(device)
        writer.end_page()
        if not more:
            break
    else:
        writer.close()
        raise ValueError('These notes are too long to export. Use a shorter lesson.')
    writer.close()
    return stream.getvalue()
