"""Static regression coverage for the Phase 6 interaction fixes."""
import unittest

import app


class PhaseSixTests(unittest.TestCase):
    def setUp(self):
        self.root = app.ROOT

    def read(self, name):
        return (self.root / name).read_text(encoding="utf-8")

    def test_intro_is_first_visit_gated_and_replayable(self):
        intro = self.read("intro.js")
        self.assertIn("pagebhasha-intro-seen", intro)
        self.assertIn("hasSeenIntro", intro)
        self.assertIn("Replay opening", intro)
        self.assertNotIn("location.hash", intro)
        self.assertLess(intro.index("scene.showModal()"), intro.index("if(!force)markIntroSeen()"))

    def test_loading_uses_learning_animation_separate_from_brand(self):
        self.assertEqual(app.FILES["/book-mark.js"], "book-mark.js")
        self.assertIn("replaceBrandImages", self.read("pages.js"))
        self.assertIn("createLearningAnimation", self.read("main.js"))
        self.assertNotIn("createBookMark", self.read("main.js"))
        self.assertIn('id="loading-book-mark"', self.read("study.html"))
        self.assertIn("loading-cover", self.read("enhancements.css"))

    def test_tour_receives_real_tab_changes(self):
        self.assertIn("pagebhasha:tabchange", self.read("main.js"))
        tools = self.read("study-tools.js")
        self.assertIn("addEventListener('pagebhasha:tabchange'", tools)
        self.assertIn("document.querySelector(`[data-tab", tools)

    def test_preferences_modal_has_scroll_safe_space(self):
        css = self.read("enhancements.css")
        self.assertIn("box-sizing:border-box", css)
        self.assertIn("env(safe-area-inset-bottom)", css)
        self.assertIn("overscroll-behavior:contain", css)


if __name__ == "__main__":
    unittest.main()
