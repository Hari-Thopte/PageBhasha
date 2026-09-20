# PageBhasha

A regional-language textbook tutor with Home, Study and Notebook pages.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py --port 8503
```

Open http://127.0.0.1:8503/study. Explore offline samples in Hindi, Tamil and English. All 26 language choices are passed to live generation, but language quality requires fluent-reader evaluation.

## Secure AI setup

Follow [the step-by-step AWS guide](handoff/05_SECURE_AI_SETUP.md).

- Local default: Gemini, with existing server environment configuration. No browser key entry or key-saving endpoint.
- AWS recommendation: PAGEBHASHA_AI_PROVIDER=bedrock and PAGEBHASHA_MODEL_ID set to a tested vision-capable Converse model/profile. The server uses IAM credentials.
- Optional Gemini on AWS: PAGEBHASHA_GEMINI_SECRET_ARN references a Secrets Manager JSON secret containing GEMINI_API_KEY. The Lambda role can read only that ARN.
- Configuration status does not verify provider access. Test an actual lesson to verify access.
- Never share .env, credentials, .venv or cloud state in a source archive.

## Learning preferences

The study page offers native-script lesson languages, explanation style, preferred starting input, larger lesson text and reduced motion. Preferences are saved in localStorage on this device. Interface labels remain English. Use Learning preferences to edit or reset settings. Text-first mode reduces upload data; live generation still needs internet.

Read-aloud uses browser voices when available. Visual notes are generated from validated lesson data and can be printed. They are not generated poster images. Notebook stores the latest 10 lessons in this tab's session; closing the session may discard them. Uploaded sources are not stored in the notebook.

## Verification

```powershell
.\.venv\Scripts\python.exe -m unittest -v
node --check web/main.js
node --check web/preferences.js
```

Tests use mocked providers and make no cloud generation calls. Bedrock/Secrets Manager integration still requires live AWS validation. SAM/Docker deployment has not been run on this computer.

## Privacy and deployment

Sources go to the server for PDF/image handling and to the configured AI provider on lesson/follow-up requests. Provider processing is Google Gemini or Amazon Bedrock according to administrator configuration. Never claim all requests use AWS when Gemini is selected.

The current template is a development starting point. See the setup guide for remaining Cognito authentication, user quotas, asynchronous generation jobs, S3 upload limits and dashboard persistence work before public deployment. No cloud resources were created by these changes.
