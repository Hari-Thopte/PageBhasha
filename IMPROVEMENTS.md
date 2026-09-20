# PageBhasha: topic analysis and improvements

## Product thesis

Students should bring the exact material that confuses them, understand it in a familiar language, connect explanations to the page, ask a follow-up and check their understanding. The core outcome is comprehension, not literal translation.

## Delivered

| Original gap | Rebuilt experience |
|---|---|
| Generic upload screen | Editorial landing page and focused study workspace |
| Dark/light style conflicts | Consistent cream, forest-green and sage design |
| One-shot explanation | Structured lesson, glossary, source excerpts, doubts and quiz |
| Unrelated fallback answers | Explicit connection errors; separate curated sample |
| Flag-based language labels | Regional languages with native-script names |
| No class context | Four class-level preferences for live requests |
| Limited input flow | Upload, drag/drop, camera picker and pasted text |
| Missing validation | Image normalization, size/format checks, bounded requests |
| Fragile clipboard HTML | Browser clipboard and UTF-8 text downloads |
| Unclear demo behavior | Hindi/Tamil/English sample clearly labelled |
| No learning feedback | Three multiple-choice questions with explanations |
| Missing source validation | Text quotations checked against input |
| Fragile preview setup | One Python launch command, no Streamlit telemetry write |

The Premium UI/UX skill guided hierarchy, native controls, focus states, responsive layouts, restrained motion and reduced-motion support. Motion Lab, CSS Buttons and It's Hover informed the interaction direction. All visual assets and code are original.

## Before submission

1. Connect an accessible vision-capable Bedrock model and validate real textbook pages in Hindi and Tamil. Cloud execution is currently unverified.
2. Check educational accuracy with a teacher and fluency with native readers. Include unreadable photos, diagrams, mixed scripts and maths in evaluation.
3. Record a three-minute demo: problem → page → regional explanation → source → doubt → practice → AWS architecture.
4. For Ship It, deploy on AWS, provide a URL and document cost/IAM choices. This artifact is a local build, not a deployed submission.
5. Evaluate with real students; report actual task completion and comprehension outcomes, not invented metrics.

Later opportunities (not implemented): validated regional speech, curriculum mapping, spaced revision and cross-device notebooks.

## Multipage and learning update

- Preserved the landing page layout; split Study and Notebook into real routes.
- Fixed stale lessons after source/preferences change or failed generation. No silent language reset.
- Restored 26 language options and checked request propagation for each (mocked provider tests, not proof of fluent output).
- Added bounded in-memory PDF rendering and page selection; scanned pages are supported as images for a vision model.
- Added structured revision sheets, process flowcharts when supported by the source, recall prompts and print styling.
- Added a reversible 3D book-opening/page-turn effect, keyboard-focus equivalent and reduced-motion fallback.
- Used Premium UI/UX, Senior Frontend and PDF guidance for the implementation. Live model access remains a configuration blocker, not something the offline sample can replace.

## Event alignment

Official sources checked on 19 September 2026:

- https://www.wemakedevs.org/aws
- https://www.wemakedevs.org/aws/first-commit
- https://www.wemakedevs.org/aws/rules

First Commit lists idea/impact, AWS usage, learning, execution and a three-minute demo video. It distinguishes local Build It from deployed Ship It and includes Best UI. The local sample alone does not demonstrate AWS AI execution; show the real Strands/Bedrock path when configured. Recheck final submission requirements before entering.

## Scope assumptions

Small hackathon team, student-facing prototype, local iteration and no authorized cloud spending/deployment. Python and Strands retained; frontend rebuilt from scratch without a JavaScript framework. No production traffic, uptime or latency measurements are claimed.
