"""PageBhasha server. Runs locally with Uvicorn, in Lambda via Mangum."""
import json
import threading
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse, Response
from starlette.concurrency import run_in_threadpool

import agent
from pdf_source import read_page
from notes_pdf import export_notes
try:
    from tts import synthesize_text
except ModuleNotFoundError:
    def synthesize_text(*args, **kwargs):
        raise RuntimeError('Optional voice synthesis is unavailable in this preview environment.')

ROOT = Path(__file__).parent / "web"
WORKERS = threading.BoundedSemaphore(2)

# ── FastAPI app ──────────────────────────────────────────────────
app = FastAPI(title="PageBhasha", docs_url=None, redoc_url=None)

SECURITY_HEADERS = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": (
        "default-src 'self'; script-src 'self'; "
        "style-src 'self' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; "
        "frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    ),
}


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    for key, value in SECURITY_HEADERS.items():
        response.headers[key] = value
    return response


# ── Static file routes (same mapping as original) ───────────────
FILES = {
    "/": "index.html", "/index.html": "index.html",
    "/styles.css": "styles.css", "/main.js": "main.js",
    "/samples.js": "samples.js", "/favicon.svg": "favicon.svg",
    "/study": "study.html", "/notebook": "notebook.html",
    "/study/": "study.html", "/notebook/": "notebook.html",
    "/pages.js": "pages.js", "/enhancements.css": "enhancements.css",
    "/book-mark.js": "book-mark.js",
    "/experience.css": "experience.css", "/demo.js": "demo.js",
    "/i18n.js": "i18n.js", "/language-data.js": "language-data.js",
    "/revision.js": "revision.js", "/preferences.js": "preferences.js",
    "/intro.js": "intro.js", "/intro.css": "intro.css",
    "/learning-utils.js": "learning-utils.js", "/study-tools.js": "study-tools.js",
    "/mindmap.js": "mindmap.js",
}
for language in ("en", "hi", "ta", "te", "bn", "mr", "kn", "gu", "ml", "pa", "or", "as", "ur", "sa", "brx", "doi", "ks", "kok", "mai", "mni", "ne", "sat", "sd"):
    FILES[f"/locales/{language}.json"] = f"locales/{language}.json"


# ── API routes ───────────────────────────────────────────────────
@app.get("/api/status")
async def status():
    return agent.settings()


@app.post("/api/learn")
async def learn(request: Request):
    return await _handle_post(request, agent.learn)


@app.post("/api/ask")
async def ask(request: Request):
    return await _handle_post(request, agent.ask)


@app.post("/api/pdf")
async def pdf(request: Request):
    return await _handle_post(request, read_page)

@app.post("/api/notes-pdf")
async def notes_pdf(request: Request):
    return await _handle_post(request, export_notes)


@app.post("/api/tts")
async def tts(request: Request):
    return await _handle_post(request, synthesize_text, media_type="audio/mpeg")


async def _handle_post(request: Request, action, media_type="application/pdf"):
    """Common POST handler: validate origin, parse JSON, apply concurrency limit."""
    origin = request.headers.get("origin")
    host = request.headers.get("host")
    if origin and host:
        from urllib.parse import urlparse
        if urlparse(origin).netloc != host:
            return JSONResponse({"error": "Cross-site requests are not allowed."}, status_code=403)

    content_type = request.headers.get("content-type", "")
    if content_type.split(";")[0] != "application/json":
        return JSONResponse({"error": "Expected JSON."}, status_code=415)

    body = await request.body()
    length = len(body)
    if not 0 < length <= 12 * 1024 * 1024:
        return JSONResponse({"error": "Request too large. Use an image below 8 MB."}, status_code=413)

    try:
        payload = json.loads(body)
    except (ValueError, UnicodeDecodeError):
        return JSONResponse({"error": "Could not read the request."}, status_code=400)

    if not WORKERS.acquire(blocking=False):
        return JSONResponse({"error": "The tutor is busy. Please try again shortly."}, status_code=429)
    try:
        result = await run_in_threadpool(action, payload)
        if isinstance(result, bytes):
            if media_type == "audio/mpeg":
                return Response(result, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=3600"})
            return Response(result, media_type="application/pdf", headers={"Content-Disposition": 'attachment; filename="PageBhasha-notes.pdf"'})
        return JSONResponse(result)
    except ValueError as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)
    except agent.LearningError as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)
    except Exception:
        return JSONResponse({"error": "Something went wrong. Please retry."}, status_code=500)
    finally:
        WORKERS.release()


# ── Static file serving (catch-all, must be last) ────────────────
@app.get("/{path:path}")
async def serve_static(path: str):
    """Serve frontend files using the same route mapping as the original server."""
    lookup = "/" + path if path else "/"
    filename = FILES.get(lookup)
    if not filename:
        return JSONResponse({"error": "Not found"}, status_code=404)
    file_path = ROOT / filename
    if not file_path.is_file():
        return JSONResponse({"error": "Not found"}, status_code=404)
    return FileResponse(file_path, headers={"Cache-Control": "no-store"})


# ── Local development server ─────────────────────────────────────
if __name__ == "__main__":
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8502)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    print(f"PageBhasha is ready at http://{args.host}:{args.port}", flush=True)
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
