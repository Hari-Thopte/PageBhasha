"""Source coordinates, provider mappings and safe downloadable notes regressions."""
import base64
import unittest
from unittest.mock import MagicMock, patch
import pymupdf
from fastapi.testclient import TestClient
import agent
import app
from pdf_source import read_page
from notes_pdf import export_notes
from test_agent import SOURCE, lesson_obj, fake_response

class WorkspaceTests(unittest.TestCase):
    def test_glossary_has_short_term_and_separate_definition(self):
        term=agent.GlossaryTerm(term='Chlorophyll',definition='The pigment that absorbs light.')
        self.assertEqual(term.term,'Chlorophyll')
        with self.assertRaises(ValueError):
            agent.GlossaryTerm(term='x'*121,definition='Definition')

    def test_invalid_evidence_links_removed_and_indexes_remapped(self):
        lesson=lesson_obj()
        valid=lesson.evidence[0]
        lesson.evidence=[agent.Evidence(quote='invented sentence',explanation='bad'),valid]
        lesson.source_links=[agent.SourceLink(explanation_index=0,evidence_indexes=[0,1,999,-1]),agent.SourceLink(explanation_index=7,evidence_indexes=[1])]
        client=MagicMock();client.models.generate_content.return_value=fake_response(lesson)
        with patch('agent._get_client',return_value=client):
            result=agent.learn({'text':SOURCE})
        self.assertEqual(result['source_links'],[{'explanation_index':0,'evidence_indexes':[0]}])

    def test_scan_has_no_invented_coordinates(self):
        with pymupdf.open() as doc:
            doc.new_page()
            data='data:application/pdf;base64,'+base64.b64encode(doc.tobytes()).decode()
        self.assertEqual(read_page({'pdf':data})['words'],[])

    def test_rotated_pdf_coordinates_stay_normalized(self):
        with pymupdf.open() as doc:
            page=doc.new_page();page.insert_text((72,72),'Plants use sunlight.');page.set_rotation(90)
            data='data:application/pdf;base64,'+base64.b64encode(doc.tobytes()).decode()
        words=read_page({'pdf':data})['words']
        self.assertEqual(words[0]['text'],'Plants')
        for w in words:
            self.assertTrue(all(0<=n<=1 for n in w['box']))

    def test_full_page_scan_with_unverified_text_layer_has_no_boxes(self):
        from io import BytesIO
        from PIL import Image
        image=BytesIO();Image.new('RGB',(600,800),'white').save(image,format='PNG')
        with pymupdf.open() as doc:
            page=doc.new_page(width=600,height=800)
            page.insert_image(page.rect,stream=image.getvalue())
            page.insert_text((72,72),'Unverified OCR text',render_mode=3)
            data='data:application/pdf;base64,'+base64.b64encode(doc.tobytes()).decode()
        result=read_page({'pdf':data})
        self.assertIn('Unverified OCR',result['text'])
        self.assertEqual(result['words'],[])

    def test_pdf_is_actual_readable_pdf(self):
        payload=lesson_obj().model_dump()
        payload.update(language='English',level='Class 9–10')
        payload['glossary']=[{'quote':'Water, a substance','explanation':'H₂O'}]
        result=export_notes(payload)
        self.assertTrue(result.startswith(b'%PDF-'))
        with pymupdf.open(stream=result,filetype='pdf') as doc:
            self.assertIn(payload['title'],''.join(p.get_text() for p in doc))

    def test_pdf_endpoint_and_origin(self):
        client=TestClient(app.app)
        result=client.post('/api/notes-pdf',json=lesson_obj().model_dump())
        self.assertEqual(result.status_code,200)
        self.assertIn('application/pdf',result.headers['content-type'])
        self.assertEqual(client.post('/api/notes-pdf',json={},headers={'origin':'https://evil.invalid'}).status_code,403)

if __name__=='__main__':unittest.main()
