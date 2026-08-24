import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "phones.json"

app = FastAPI(title="Mobile Compare")

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


def load_phones():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/")
def home(request: Request):
    phones = load_phones()
    phones_sorted = sorted(phones, key=lambda p: (p["brand"], p["name"]))
    return templates.TemplateResponse(
        request, "index.html", {"phones": phones_sorted}
    )


@app.get("/api/phones")
def api_phones():
    return JSONResponse(load_phones())


@app.get("/api/phones/{phone_id}")
def api_phone(phone_id: str):
    phones = load_phones()
    for p in phones:
        if p["id"] == phone_id:
            return JSONResponse(p)
    return JSONResponse({"error": "Phone not found"}, status_code=404)


@app.get("/api/compare")
def api_compare(phone1: str, phone2: str):
    phones = {p["id"]: p for p in load_phones()}
    p1 = phones.get(phone1)
    p2 = phones.get(phone2)
    if not p1 or not p2:
        return JSONResponse({"error": "One or both phones not found"}, status_code=404)
    return JSONResponse({"phone1": p1, "phone2": p2})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
