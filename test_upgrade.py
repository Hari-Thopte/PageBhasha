"""Offline regression coverage; provider responses are mocked, not language-quality tests."""
import base64
import json
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
import agent
import app
from pdf_source import read_page
from test_agent import SOURCE, lesson_obj, fake_response

class UpgradeTests(unittest.TestCase):
    def test_all_26_languages_reach_model(self):
        self.assertEqual(len(agent.LANGUAGES), 34)
        for language in agent.LANGUAGES:
            mock_client = MagicMock()
            mock_client.models.generate_content.return_value = fake_response(lesson_obj())
            with self.subTest(language=language), patch('agent._get_client', return_value=mock_client):
                result=agent.learn({'text':SOURCE,'language':language})
                self.assertEqual(result['language'],language)
                # Verify the language preference was sent to the model
                call_args = mock_client.models.generate_content.call_args
                contents = call_args.kwargs.get('contents') or call_args[1].get('contents', [])
                content_str = str(contents)
                self.assertIn(language, content_str)

    def test_ui_contains_all_backend_languages(self):
        script=(app.ROOT/'language-data.js').read_text(encoding='utf-8')
        for language in agent.LANGUAGES:
            self.assertIn("['"+language+"'",script)

    def test_exam_notes_require_revision(self):
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = fake_response(lesson_obj())
        with patch('agent._get_client', return_value=mock_client):
            with self.assertRaises(agent.LearningError):
                agent.learn({'text':SOURCE,'style':'Exam notes'})

    def test_exam_notes_preserve_diagram(self):
        result=lesson_obj()
        result.revision=agent.Revision(title='Revision',key_points=['Plants make food.'],remember='Light provides energy.',recall=['What does light provide?'],diagram=agent.Diagram(title='Process',steps=['Collect inputs','Make glucose'],caption='Source-derived process.'))
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = fake_response(result)
        with patch('agent._get_client', return_value=mock_client):
            output=agent.learn({'text':SOURCE,'style':'Exam notes'})
        self.assertEqual(len(output['revision']['diagram']['steps']),2)

    def test_diagram_bounded(self):
        for steps in [[],['one'],['step']*7]:
            with self.assertRaises(ValueError):
                agent.Diagram(title='x',steps=steps,caption='x')

    def test_multipage_documents(self):
        for path, title in [('/', 'Your textbook.'),('/study', 'Learning <em>Mode.'),('/notebook','My <em>notebook.')]:
            body=(app.ROOT/app.FILES[path]).read_text(encoding='utf-8')
            self.assertIn(title,body)
        home=(app.ROOT/'index.html').read_text(encoding='utf-8')
        self.assertNotIn('id="study-view"',home)
        self.assertNotIn('id="home-view"',(app.ROOT/'study.html').read_text(encoding='utf-8'))

    def test_visual_notes_workspace_is_present(self):
        study=(app.ROOT/'study.html').read_text(encoding='utf-8')
        revision=(app.ROOT/'revision.js').read_text(encoding='utf-8')
        self.assertIn('data-tab="visual"',study)
        self.assertIn('id="visual-notes"',study)
        self.assertIn('visualNotesMarkup',revision)
        self.assertIn('Source-grounded notes',revision)

    def test_bad_pdf_inputs(self):
        for payload in [[],{}, {'pdf':'not-pdf'}, {'pdf':'data:application/pdf;base64,!!!'}, {'pdf':'data:application/pdf;base64,YQ=='}, {'pdf':'data:application/pdf;base64,','page':True}]:
            with self.subTest(payload=payload),self.assertRaises(ValueError):read_page(payload)

    def test_corrupt_pdf(self):
        payload={'pdf':'data:application/pdf;base64,'+base64.b64encode(b'%PDF-invalid').decode()}
        with self.assertRaises(ValueError):read_page(payload)

    def test_pdf_page_render_and_limits(self):
        # Mock document internals: test API bounds without creating a PDF artifact.
        data='data:application/pdf;base64,'+base64.b64encode(b'%PDF-test').decode()
        document=MagicMock();document.needs_pass=False;document.page_count=2
        sheet=document.__getitem__.return_value
        sheet.rect.width=600;sheet.rect.height=800
        sheet.get_text.side_effect=lambda *args,**kwargs: [] if args and args[0]=='words' else SOURCE
        sheet.get_pixmap.return_value.tobytes.return_value=b'png'
        with patch('pdf_source.pymupdf.open') as opener:
            opener.return_value.__enter__.return_value=document
            result=read_page({'pdf':data,'page':2})
            self.assertEqual(result['pages'],2)
            self.assertEqual(result['text'],SOURCE)
            document.__getitem__.assert_called_with(1)
            with self.assertRaises(ValueError):read_page({'pdf':data,'page':3})
            document.needs_pass=True
            with self.assertRaises(ValueError):read_page({'pdf':data})

    def test_real_pdf_engine_in_memory(self):
        import pymupdf
        # Transient test bytes only; no PDF artifact or source files are written.
        with pymupdf.open() as fixture:
            fixture.new_page().insert_text((72,72), 'Page one: plants use sunlight.')
            fixture.new_page().insert_text((72,72), 'Page two: water evaporates when heated.')
            data='data:application/pdf;base64,'+base64.b64encode(fixture.tobytes()).decode()
        result=read_page({'pdf':data,'page':2})
        self.assertEqual(result['pages'],2)
        self.assertIn('water evaporates',result['text'])
        self.assertTrue(base64.b64decode(result['image'].split(',')[1]).startswith(b'\x89PNG'))

if __name__=='__main__':unittest.main()
