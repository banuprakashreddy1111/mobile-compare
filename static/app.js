const compareBtn = document.getElementById("compareBtn");
const resultEl = document.getElementById("result");

const SPEC_ROWS = [
  { key: "price_inr", label: "Price", format: (v) => `₹${v.toLocaleString("en-IN")}`, lowerIsBetter: true },
  { key: "processor", label: "Processor", numeric: false },
  { key: "ram_gb", label: "RAM", format: (v) => `${v} GB` },
  { key: "storage_gb", label: "Storage", format: (v) => `${v} GB` },
  { key: "display", label: "Display", numeric: false },
  { key: "refresh_rate_hz", label: "Refresh", format: (v) => `${v} Hz` },
  { key: "camera", label: "Camera", numeric: false },
  { key: "battery_mah", label: "Battery", format: (v) => `${v} mAh` },
  { key: "charging_watts", label: "Charging", format: (v) => `${v} W` },
  { key: "has_5g", label: "5G", format: (v) => (v ? "Yes" : "No"), numeric: false },
  { key: "os", label: "OS", numeric: false },
];

const STORES = [
  { name: "Amazon", urlFor: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}` },
  { name: "Flipkart", urlFor: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}` },
  { name: "Croma", urlFor: (q) => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}` },
  { name: "Reliance Digital", urlFor: (q) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}` },
  { name: "Tata Cliq", urlFor: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}` },
];

function renderStoreLinks(query) {
  return STORES.map(
    (s) => `<a href="${s.urlFor(query)}" target="_blank" rel="noopener">${s.name} →</a>`
  ).join("");
}

async function fetchPhone(id) {
  const res = await fetch(`/api/phones/${id}`);
  if (!res.ok) throw new Error("Phone not found");
  return res.json();
}

function renderHeader(phone) {
  return `
    <div class="phone-head">
      <div class="brand-tag">${phone.brand}</div>
      <h2>${phone.name}</h2>
      <div class="price">₹${phone.price_inr.toLocaleString("en-IN")}</div>
      <div class="links">
        ${renderStoreLinks(`${phone.brand} ${phone.name}`)}
      </div>
    </div>
  `;
}

function renderRow(row, p1, p2) {
  const v1 = p1[row.key];
  const v2 = p2[row.key];
  const display1 = row.format ? row.format(v1) : v1;
  const display2 = row.format ? row.format(v2) : v2;

  let cls1 = "";
  let cls2 = "";
  let gaugeHtml1 = "";
  let gaugeHtml2 = "";

  const isNumeric = row.numeric !== false && typeof v1 === "number" && typeof v2 === "number";

  if (isNumeric) {
    const max = Math.max(v1, v2, 1);
    const pct1 = Math.max(6, Math.round((v1 / max) * 100));
    const pct2 = Math.max(6, Math.round((v2 / max) * 100));

    if (v1 !== v2) {
      const better = row.lowerIsBetter ? Math.min(v1, v2) : Math.max(v1, v2);
      if (v1 === better) cls1 = "win";
      if (v2 === better) cls2 = "win";
    }

    gaugeHtml1 = `<div class="gauge"><div class="gauge-fill ${cls1}" style="width:${pct1}%"></div></div>`;
    gaugeHtml2 = `<div class="gauge"><div class="gauge-fill ${cls2}" style="width:${pct2}%"></div></div>`;
  }

  return `
    <div class="spec-row">
      <div class="label">${row.label}</div>
      <div class="spec-cell">
        <span class="spec-value ${cls1}">${display1}</span>
        ${gaugeHtml1}
      </div>
      <div class="spec-cell">
        <span class="spec-value ${cls2}">${display2}</span>
        ${gaugeHtml2}
      </div>
    </div>
  `;
}

async function compare() {
  const id1 = document.getElementById("phone1").value;
  const id2 = document.getElementById("phone2").value;

  if (!id1 || !id2) {
    alert("Please select two phones to compare.");
    return;
  }

  compareBtn.disabled = true;
  compareBtn.textContent = "Running…";

  try {
    const [p1, p2] = await Promise.all([fetchPhone(id1), fetchPhone(id2)]);

    const rowsHtml = SPEC_ROWS.map((row) => renderRow(row, p1, p2)).join("");

    resultEl.innerHTML = `
      <div class="phone-headers">
        ${renderHeader(p1)}
        ${renderHeader(p2)}
      </div>
      <div class="spec-table">
        ${rowsHtml}
      </div>
    `;
    resultEl.classList.remove("hidden");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    alert("Something went wrong loading those phones.");
    console.error(err);
  } finally {
    compareBtn.disabled = false;
    compareBtn.textContent = "Run comparison";
  }
}

compareBtn.addEventListener("click", compare);

// --- Search any phone (not just the built-in list) ---
const anySearchBtn = document.getElementById("anySearchBtn");
const anySearchInput = document.getElementById("anySearchInput");
const anySearchResult = document.getElementById("anySearchResult");

function searchAnyPhone() {
  const name = anySearchInput.value.trim();
  if (!name) {
    alert("Type a phone name first, e.g. iQOO Z7 Pro");
    return;
  }
  anySearchResult.innerHTML = `
    <div class="phone-head">
      <h2>${name}</h2>
      <div class="links">
        ${renderStoreLinks(name)}
      </div>
    </div>
  `;
  anySearchResult.classList.remove("hidden");
}

if (anySearchBtn) {
  anySearchBtn.addEventListener("click", searchAnyPhone);
  anySearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchAnyPhone();
  });
}
