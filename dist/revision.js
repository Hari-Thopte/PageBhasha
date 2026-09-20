import {escape as htmlEscape, languages} from './pages.js';
import {plainMath, glossaryEntry} from './learning-utils.js';
const escape = value => htmlEscape(plainMath(value));

const sampleRevision = {
  English:{title:'Your one-page revision sheet',remember:'Sunlight supplies energy. Water and carbon dioxide are the material ingredients.',diagram:{title:'From sunlight to stored energy',steps:['Roots absorb water; stomata take in carbon dioxide','Chlorophyll captures light energy','Light energy powers conversion into glucose','Oxygen is released as a by-product'],caption:'A simplified sequence drawn from the sample passage.'}},
  Hindi:{title:'एक पन्ने में दोहराएँ',remember:'सूरज की रोशनी ऊर्जा देती है। पानी और कार्बन डाइऑक्साइड भौतिक सामग्री हैं।',diagram:{title:'प्रकाश से संचित ऊर्जा तक',steps:['जड़ें पानी लेती हैं; रंध्रों से कार्बन डाइऑक्साइड आती है','क्लोरोफिल प्रकाश की ऊर्जा सोखता है','प्रकाश की ऊर्जा से ग्लूकोज़ बनता है','ऑक्सीजन उप-उत्पाद के रूप में निकलती है'],caption:'नमूना पाठ में बताई गई प्रक्रिया का सरल क्रम।'}},
  Tamil:{title:'ஒரு பக்க மீள்பார்வை',remember:'சூரிய ஒளி ஆற்றலை வழங்குகிறது. நீரும் கார்பன் டைஆக்சைடும் மூலப்பொருட்கள்.',diagram:{title:'ஒளியிலிருந்து சேமித்த ஆற்றல் வரை',steps:['வேர்கள் நீரை உறிஞ்சுகின்றன; இலைத்துளைகள் வழி கார்பன் டைஆக்சைடு வருகிறது','பச்சையம் ஒளி ஆற்றலை உறிஞ்சுகிறது','ஒளி ஆற்றலால் குளுக்கோஸ் உருவாகிறது','ஆக்சிஜன் துணை விளைபொருளாக வெளியேறுகிறது'],caption:'மாதிரி உரையிலுள்ள செயல்முறையின் எளிய வரிசை.'}}
};

export function sampleNotes(language, lesson){
  return {...structuredClone(sampleRevision[language] || sampleRevision.English), key_points: lesson.takeaways, recall: lesson.followups};
}

export function revisionMarkup(lesson){
  const r = lesson.revision;
  if (!r) return '';
  const labels = lesson.headings || ['Step by step', 'Key points', 'Definitions', 'Source'];
  return `<section class="revision-sheet"><div class="revision-heading"><span class="revision-icon" aria-hidden="true">✎</span><div><span class="eyebrow">${escape(lesson.style)} · ${escape(lesson.level)}</span><h3>${escape(r.title)}</h3></div></div><div class="revision-points">${r.key_points.map((x,i)=>`<article><span>0${i+1}</span><p>${escape(x)}</p></article>`).join('')}</div>${r.diagram?`<figure class="concept-flow"><figcaption><h3>${escape(r.diagram.title)}</h3><p>${escape(r.diagram.caption)}</p></figcaption><ol>${r.diagram.steps.map((x,i)=>`<li><span class="flow-number">${i+1}</span><span>${escape(x)}</span></li>`).join('')}</ol></figure>`:''}<aside class="remember-card"><span aria-hidden="true">✳</span><p>${escape(r.remember)}</p></aside><div class="recall-cards"><h3>${escape(labels[0])} · ↻</h3>${r.recall.map(q=>`<div><span aria-hidden="true">?</span>${escape(q)}</div>`).join('')}</div></section>`;
}

function extractBranch(text, index, glossaryList) {
  if (!text) return { title: `Concept 0${index + 1}`, tag: 'Topic', relationLabel: 'CORE PRINCIPLE', detail: '' };
  const clean = text.trim();

  // 1. Check if any glossary term matches at the start of this text
  if (glossaryList && glossaryList.length) {
    for (const g of glossaryList) {
      const gEntry = glossaryEntry(g);
      const term = gEntry.term.trim();
      if (term && clean.toLowerCase().startsWith(term.toLowerCase())) {
        const remainder = clean.slice(term.length).replace(/^[:\-–—\s,]+/, '').trim();
        return {
          title: term,
          tag: 'Key Term',
          relationLabel: 'DEFINITION & ROLE',
          detail: remainder || gEntry.definition || clean
        };
      }
    }
  }

  // 2. Colon / dash / em-dash separator (e.g., "Inputs: water and carbon dioxide. Energy source: sunlight.")
  const sepMatch = clean.match(/^([^:\-–—]{3,35})[:\-–—]\s*(.+)$/);
  if (sepMatch) {
    const rawTitle = sepMatch[1].trim();
    const detail = sepMatch[2].trim();
    return {
      title: rawTitle,
      tag: 'Branch',
      relationLabel: 'RELATION & SPECIFICS',
      detail: detail
    };
  }

  // 3. Subject-Verb break (e.g., "Data structures organize and store data." -> "Data structures" + "Organize and store data.")
  const verbMatch = clean.match(/^([^,;]{3,35}?)\s+\b(is|are|means|consists\s+of|organizes?|provides?|improves?|enables?|stores?|processes?|helps?|creates?|converts?|requires?|generates?)\b\s*(.+)$/i);
  if (verbMatch) {
    const subj = verbMatch[1].trim();
    const verb = verbMatch[2].trim();
    const rest = verbMatch[3].trim();
    const capitalizedVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
    return {
      title: subj,
      tag: 'Mechanism',
      relationLabel: 'FUNCTION & ROLE',
      detail: `${capitalizedVerb} ${rest}`
    };
  }

  // 4. Semicolon or full-stop separator
  const semiMatch = clean.match(/^([^;.]{3,35})[;.]\s*(.+)$/);
  if (semiMatch) {
    return {
      title: semiMatch[1].trim(),
      tag: 'Principle',
      relationLabel: 'CORE EXPLANATION',
      detail: semiMatch[2].trim()
    };
  }

  // 5. Clean word split without cutting mid-sentence or ending with conjunctions/prepositions
  const words = clean.split(/\s+/);
  if (words.length <= 4) {
    return {
      title: clean,
      tag: 'Concept',
      relationLabel: 'TAKEAWAY',
      detail: clean
    };
  }

  let titleWords = words.slice(0, 3).join(' ');
  titleWords = titleWords.replace(/\s+(and|of|to|with|in|the|a|for|by|or)$/i, '').trim();
  return {
    title: titleWords,
    tag: 'Takeaway',
    relationLabel: 'EXPLANATION',
    detail: clean
  };
}

export function visualNotesMarkup(lesson){
  const r = lesson.revision || {};
  const terms = (lesson.glossary || []).slice(0, 5);
  const process = r.diagram;
  const highlights = (r.key_points || lesson.takeaways || []).slice(0, 5);
  const recall = (r.recall || lesson.followups || []).slice(0, 3);

  let branches = [];
  
  // 1. First priority: Glossary terms represent clear semantic concepts & definitions
  if (terms && terms.length >= 2) {
    const roleTags = ['Architecture', 'Procedure', 'Optimization', 'Component', 'Principle'];
    terms.slice(0, 4).forEach((t, i) => {
      const ge = glossaryEntry(t);
      if (ge.term) {
        branches.push({
          title: ge.term,
          tag: roleTags[i] || 'Concept',
          relationLabel: 'DEFINITION & UTILITY',
          detail: ge.definition || lesson.summary
        });
      }
    });
  }

  // 2. Second priority: If fewer than 3 terms, pull key takeaway points
  if (branches.length < 3) {
    highlights.forEach((pt, i) => {
      if (branches.length < 4) {
        const b = extractBranch(pt, i, terms);
        if (!branches.some(existing => existing.title.toLowerCase() === b.title.toLowerCase())) {
          branches.push(b);
        }
      }
    });
  }

  // Fallback if empty
  if (branches.length === 0) {
    branches = [{
      title: lesson.title || 'Core Subject',
      tag: 'Core Concept',
      relationLabel: 'SUMMARY & SCOPE',
      detail: lesson.summary || 'Fundamental principles and key topics of this study.'
    }];
  }

  const mindmapMarkup = `
  <article class="board-card board-mindmap-wrap">
    <div class="mindmap-top-bar">
      <div class="mindmap-heading-group">
        <span class="mindmap-tag">✦ Interactive Concept Mindmap</span>
        <h4 class="mindmap-subheading">Topic Architecture &amp; Relationships</h4>
      </div>
    </div>
    <div class="mindmap-canvas-container" id="mindmap-container">
      <!-- Dynamic interactive tree canvas initialized by mindmap.js -->
    </div>
  </article>`;

  let processChartMarkup = '';
  if (process && process.steps && process.steps.length) {
    processChartMarkup = `
    <article class="board-card board-flowchart-wrap">
      <div class="chart-heading">
        <span class="chart-badge">📊 Process Flow &amp; Sequence Chart</span>
        <h4>${escape(process.title)}</h4>
        <p>${escape(process.caption)}</p>
      </div>
      <div class="flowchart-nodes-grid">
        ${process.steps.map((step, i) => `
          <div class="flowchart-node">
            <span class="flowchart-step-badge">Stage 0${i + 1}</span>
            <p>${escape(step)}</p>
            ${i < process.steps.length - 1 ? '<span class="flowchart-arrow" aria-hidden="true">→</span>' : ''}
          </div>
        `).join('')}
      </div>
    </article>`;
  }

  const chips = terms.length ? terms.map((term, i) => `<span class="term-chip tint-${i % 4}">${escape(glossaryEntry(term).term)}</span>`).join('') : '<p>Key terms will appear when the lesson includes them.</p>';
  const points = highlights.map((point, i) => `<li><b>${i + 1}</b><span>${escape(point)}</span></li>`).join('');
  const questions = recall.map(question => `<p>✦ ${escape(question)}</p>`).join('');

  return `<section class="visual-board" lang="${escape(languages.find(x => x[0] === lesson.language)?.[2] || 'en')}">
    <header class="visual-title">
      <span>VISUAL REVISION BOARD · MINDMAP</span>
      <h3>${escape(lesson.title)}</h3>
      <p>${escape(lesson.summary)}</p>
    </header>
    ${mindmapMarkup}
    ${processChartMarkup}
    <article class="board-card board-concepts">
      <h4>Key concepts</h4>
      <div>${chips}</div>
    </article>
    <article class="board-card board-remember">
      <h4>Remember this</h4>
      <p>${escape(r.remember || lesson.takeaways[0] || lesson.summary)}</p>
    </article>
    <article class="board-card board-points">
      <h4>Short notes</h4>
      <ol>${points}</ol>
    </article>
    <article class="board-card board-recall">
      <h4>Check yourself</h4>
      ${questions}
    </article>
    <footer class="visual-footer">
      <span>Source-grounded notes</span>
      <span>${escape(lesson.language)} · ${escape(lesson.level)}</span>
    </footer>
  </section>`;
}

export function revisionText(lesson){
  const r = lesson.revision;
  if (!r) return '';
  return `\n\n${r.title}\n${r.key_points.join('\n')}\n\n${r.remember}\n${r.diagram ? '\n' + r.diagram.title + '\n' + r.diagram.steps.join('\n↓\n') + '\n' + r.diagram.caption : ''}\n\n${r.recall.join('\n')}`;
}
