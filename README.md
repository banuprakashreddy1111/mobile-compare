# Mobile Compare

A working phone comparison website. Pick two phones, see specs side by side, jump to Amazon/Flipkart to buy.

## Run it

```bash
pip install -r requirements.txt
python3 server.py
```

Then open **http://localhost:8000** in your browser.

## What's included

- `server.py` — FastAPI app (routes + API)
- `templates/index.html` — the page
- `static/style.css`, `static/app.js` — styling + compare logic
- `data/phones.json` — built-in database of 15 popular phones (specs + indicative prices)

## Notes

- Prices in `data/phones.json` are indicative/starting prices, not live. Amazon/Flipkart don't offer a public price API, so each phone has direct search links to check live prices instead of an unreliable live scraper.
- To add more phones, just add another entry to `data/phones.json` — no code changes needed.
- To update prices, edit `price_inr` in that same file.
