"""Bounded, in-memory PDF page preview. No document or extracted text is persisted."""
import base64
import binascii
import pymupdf

def read_page(payload):
    if not isinstance(payload, dict):
        raise ValueError("Expected a PDF request.")
    data = payload.get("pdf", "")
    page = payload.get("page", 1)
    if not isinstance(data, str) or not data.startswith("data:application/pdf;base64,"):
        raise ValueError("Choose a PDF document.")
    if type(page) is not int or page < 1:
        raise ValueError("Choose a valid page number.")
    try:
        raw = base64.b64decode(data.split(",", 1)[1], validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("This PDF could not be decoded.") from exc
    if len(raw) > 8 * 1024 * 1024 or not raw.startswith(b"%PDF-"):
        raise ValueError("Choose a valid PDF smaller than 8 MB.")
    try:
        with pymupdf.open(stream=raw, filetype="pdf") as document:
            if document.needs_pass:
                raise ValueError("This PDF is password protected. Upload an unlocked copy.")
            if not 1 <= document.page_count <= 500:
                raise ValueError("Use a PDF with 1–500 pages.")
            if page > document.page_count:
                raise ValueError("That page is not in this document.")
            sheet = document[page - 1]
            dimension = max(sheet.rect.width, sheet.rect.height)
            if dimension <= 0:
                raise ValueError("This page has invalid dimensions.")
            pix = sheet.get_pixmap(matrix=pymupdf.Matrix(1600 / dimension, 1600 / dimension), alpha=False)
            words = []
            # A full-page raster with a hidden text layer may be OCR. Do not
            # promise precise alignment for those scans until OCR is verified.
            scanned = any((pymupdf.Rect(info["bbox"]) & sheet.rect).get_area() > sheet.rect.get_area() * .8
                          for info in sheet.get_image_info())
            for word in ([] if scanned else sheet.get_text("words", sort=True)[:4000]):
                rect = pymupdf.Rect(word[:4]) * sheet.rotation_matrix
                words.append({"text": word[4], "box": [rect.x0 / sheet.rect.width,
                    rect.y0 / sheet.rect.height, rect.width / sheet.rect.width, rect.height / sheet.rect.height]})
            return {"image": "data:image/png;base64," + base64.b64encode(pix.tobytes("png")).decode(),
                    "text": sheet.get_text()[:16000], "words": words, "page": page, "pages": document.page_count}
    except (pymupdf.FileDataError, RuntimeError) as exc:
        raise ValueError("This PDF could not be opened. Try another copy or a page photo.") from exc
