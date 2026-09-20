# AWS plan for PageBhasha

This is a focused hackathon architecture. It supports the product promise—turn one textbook page into a source-grounded regional-language lesson—without spending the $200 credit on services the demo does not need.

## Build this first

```text
Student browser
  │ upload one page / choose language
  ▼
CloudFront + S3 (static web app)
  │ HTTPS API request
  ▼
API Gateway → Lambda (PageBhasha API)
  │              │
  │              ├─ validates size/type, rate-limits and makes short-lived S3 upload URLs
  │              └─ invokes Bedrock through Strands
  ▼
Amazon Bedrock vision-capable model
  │ structured lesson, notes, quiz, optional process diagram
  ▼
Browser renders the answer
```

### Essential services

| Service | Why it belongs in this project | First use |
|---|---|---|
| Amazon Bedrock | Reads page images/text and generates the lesson in the selected language | Core tutor; keep the current Strands + Pydantic structure |
| AWS Lambda + API Gateway | Runs the small secure API without maintaining a server | Replace local `app.py` endpoints for `/learn`, `/ask`, and PDF-page rendering |
| Amazon S3 | Holds an uploaded source briefly without sending large files through API Gateway | Private bucket; direct presigned upload; auto-delete objects after 24 hours |
| CloudFront + S3 | Hosts the static frontend securely and quickly | Public demo URL for Ship It |
| CloudWatch | Shows errors, latency and Bedrock call failures | One dashboard and two alarms |
| AWS Budgets | Prevents credit surprises | Alerts at $25, $75, $125 and $175 |

## Add only after the core demo works

| Service | User value | Keep / skip decision |
|---|---|---|
| Amazon Textract | Extracts selectable text from a clear scanned textbook page, enabling “highlight → explain” | Add if the demo needs selected-text interactions; Bedrock vision alone is enough for a first demo |
| DynamoDB | Saves a student’s generated notes, quiz progress and bookmarks | Add only after sign-in is useful; do not save raw uploads by default |
| Cognito | Student sign-in and private saved-notes access | Useful for a deployed multi-user version, not necessary for an anonymous demo |
| Amazon Polly | Read-aloud where a suitable voice is available | Validate target-language voice support before promising it; don’t make it a core hackathon claim |
| Amazon Nova Canvas through Bedrock | Optional original illustration behind an Exam Notes board | Use only after the structured board works; do not use it for text-heavy notes because generated image text can be inaccurate |

## Do not build for this hackathon

- RDS/Aurora, ECS, Kubernetes, VPC/NAT infrastructure, queues, data lakes, analytics pipelines, or a generic dashboard.
- Storing every uploaded textbook page forever.
- A diagram generator that invents diagrams for every topic. Keep the source-derived process-flow rule already in the app.
- Using image generation as the source of truth for notes. The structured lesson remains authoritative; any illustration is decorative and clearly labelled.

## Demo flow that proves AWS value

1. Upload a real textbook page to private S3 using a presigned URL.
2. Choose Hindi, Tamil, or another selected language and class level.
3. Lambda sends only that selected page plus preferences to Bedrock via Strands.
4. Bedrock returns structured explanation, evidence excerpts, quiz and exam notes.
5. When the source contains a process, show the generated flowchart.
6. Optionally request a separate Nova Canvas illustration prompt from the already-validated lesson structure, then layer it behind browser-rendered notes. Do not ask the image model to write the notes themselves.
7. Ask a source-bound follow-up, then show CloudWatch request data—not fabricated product metrics.

## Cost and safety guardrails

- Start with a single available Bedrock model/inference profile and test with a few real pages.
- Cap source size, rendered page resolution and output tokens (the current code already does this).
- Require authenticated production users or a server-side rate limit before public sharing.
- Use least-privilege IAM: Lambda can invoke only the chosen Bedrock model and read/write only the scoped S3 prefix.
- Keep the S3 bucket private, block public access, use encryption, and add a 24-hour lifecycle rule.
- Set AWS Budgets alerts before running tests against real models. Do not place access keys in JavaScript, the ZIP, or chat.

## Order of implementation

1. Ask your AWS organiser which Bedrock model/region/inference profile is enabled for the credits.
2. Configure that model locally and verify one image lesson plus one text lesson in two languages.
3. Deploy the existing backend as Lambda/API Gateway and host the frontend with S3/CloudFront.
4. Add private S3 presigned uploads and 24-hour expiry.
5. Add Cognito + DynamoDB only if saved cross-device notes are essential to your presentation.

No AWS resources are created by this document. Model availability, supported languages and pricing must be verified in the specific AWS account and region supplied by the hackathon.

## Optional illustration request

Use the Bedrock tutor first. It returns validated title, terms, process steps and visual concept in structured JSON. Then make a separate optional request to Amazon Nova Canvas with only a short illustration prompt, for example: “flat botanical textbook illustration of a green leaf using sunlight, water and carbon dioxide; no labels, no text.” Store the result briefly in private S3 and layer it behind browser-rendered notes. Do not ask an image model to write notes, formulas or labels. Nova Canvas image generation is available through the Bedrock `InvokeModel` API. [Amazon Nova Canvas documentation](https://docs.aws.amazon.com/nova/latest/userguide/image-generation.html)

For the text and board itself, retain structured output: Bedrock can constrain model output to JSON schemas, reducing parsing and retry failures. The current Pydantic lesson model provides this shape in the local prototype. [Amazon Bedrock structured outputs documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/structured-output.html)
