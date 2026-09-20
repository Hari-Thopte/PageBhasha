"""Test speech synthesis service and /api/tts endpoint."""
import unittest
from fastapi.testclient import TestClient
from app import app
from tts import synthesize_text, LANG_MAP

class TTSTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_synthesize_text_supported_languages(self):
        # Test Tamil
        ta_bytes = synthesize_text({"text": "வணக்கம்", "language": "Tamil"})
        self.assertIsInstance(ta_bytes, bytes)
        self.assertGreater(len(ta_bytes), 1000)

        # Test Telugu
        te_bytes = synthesize_text({"text": "నమస్కారం", "language": "Telugu"})
        self.assertIsInstance(te_bytes, bytes)
        self.assertGreater(len(te_bytes), 1000)

        # Test English
        en_bytes = synthesize_text({"text": "Hello world", "language": "English"})
        self.assertIsInstance(en_bytes, bytes)
        self.assertGreater(len(en_bytes), 1000)

    def test_synthesize_empty_text_raises_error(self):
        with self.assertRaises(ValueError):
            synthesize_text({"text": "   ", "language": "Hindi"})

    def test_api_tts_endpoint_success(self):
        response = self.client.post("/api/tts", json={"text": "வணக்கம் இது சோதனை", "language": "Tamil"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("content-type"), "audio/mpeg")
        self.assertGreater(len(response.content), 1000)

    def test_api_tts_empty_payload(self):
        response = self.client.post("/api/tts", json={})
        self.assertEqual(response.status_code, 400)

    def test_all_scheduled_languages_mapped(self):
        from agent import LANGUAGES
        for lang in LANGUAGES:
            lower = lang.lower()
            self.assertIn(lower, LANG_MAP, f"Language {lang} missing from TTS LANG_MAP")

if __name__ == "__main__":
    unittest.main()
