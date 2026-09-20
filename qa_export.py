"""Generate a local visual QA artifact; not used by the running service."""
from pathlib import Path
import pymupdf
from notes_pdf import export_notes
from test_agent import lesson_obj

output=Path('tmp/pdfs');output.mkdir(parents=True,exist_ok=True)
lesson=lesson_obj().model_dump()
lesson.update(language='Hindi / Tamil / English',level='Class 9–10',
 title='Photosynthesis · प्रकाश संश्लेषण · ஒளிச்சேர்க்கை',
 summary='पौधे सूर्य के प्रकाश की सहायता से अपना भोजन बनाते हैं। தாவரங்கள் சூரிய ஒளியைப் பயன்படுத்தி உணவு தயாரிக்கின்றன.',
 explanation=['Green plants use sunlight to turn $CO_2$ and $H_2O$ into food.',
 'पानी और कार्बन डाइऑक्साइड से ग्लूकोज़ बनता है।',
 'நீரும் கார்பன் டைஆக்சைடும் மூலப்பொருட்கள்.'],
 glossary=[{'term':'Chlorophyll · क्लोरोफिल · பச்சையம்','definition':'The pigment that absorbs light energy.'}])
binary=export_notes(lesson)
(output/'notes-qa.pdf').write_bytes(binary)
with pymupdf.open(stream=binary,filetype='pdf') as doc:
    for i,page in enumerate(doc):
        page.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5)).save(output/f'notes-qa-{i+1}.png')
    print('PDF pages:',len(doc))
