import io
import pypdf


class PDFParseError(Exception):
    pass


def extract_text(file_bytes: bytes) -> str:
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        if not text:
            raise PDFParseError("텍스트를 추출할 수 없습니다. 이미지 기반 PDF일 수 있습니다.")
        return text
    except PDFParseError:
        raise
    except Exception as e:
        raise PDFParseError(str(e)) from e
