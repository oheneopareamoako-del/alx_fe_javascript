// script.js

// Storage keys
const STORAGE_KEY = "dynamic_quotes_v1";
const LAST_QUOTE_KEY = "last_viewed_quote_v1";

// --- Helper: load/save quotes from/to localStorage
function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultQuotes();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultQuotes();
    // basic validation: ensure items have text and category
    return parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
  } catch (err) {
    console.warn("Could not parse stored quotes, falling back to defaults.", err);
    return defaultQuotes();
  }
}

function saveQuotes(quotes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// default fallback quotes
function defaultQuotes() {
  return [
    { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "Design" },
    { text: "JavaScript is the language of the web.", category: "Programming" },
    { text: "Success is not final; failure is not fatal.", category: "Motivation" }
  ];
}

// application state
let quotes = loadQuotes();

// DOM handles
const quoteDisplay = () => document.getElementById("quoteDisplay");
const newQuoteBtn = () => document.getElementById("newQuote");
const addQuoteContainer = () => document.getElementById("addQuoteContainer");
const categoryFilter = () => document.getElementById("categoryFilter");
const exportBtn = () => document.getElementById("exportBtn");
const importFileInput = () => document.getElementById("importFile");

// --- Utility: refresh the category dropdown
function refreshCategoryOptions() {
  const select = categoryFilter();
  if (!select) return;
  const categories = Array.from(new Set(quotes.map(q => q.category.trim()).filter(Boolean))).sort();
  select.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All";
  select.appendChild(allOpt);
  categories.forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    select.appendChild(o);
  });
}

// --- Show a random quote (respects selected category). Stores last viewed quote in sessionStorage
function showRandomQuote() {
  const display = quoteDisplay();
  if (!display) return;

  let pool = quotes;
  const filter = categoryFilter();
  if (filter && filter.value && filter.value !== "all") {
    pool = quotes.filter(q => q.category === filter.value);
  }

  if (pool.length === 0) {
    display.innerHTML = "<em>No quotes available for that category.</em>";
    sessionStorage.removeItem(LAST_QUOTE_KEY);
    return;
  }

  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];

  display.innerHTML = `<p style="font-size:18px; margin:0 0 8px 0">"${escapeHtml(q.text)}"</p>
                       <small>— ${escapeHtml(q.category)}</small>`;

  // store last viewed quote in sessionStorage
  try {
    sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(q));
  } catch (e) {
    // ignore sessionStorage errors
  }
}

// small helper to avoid injecting raw HTML: escape text
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}

// --- Add a new quote (push to array, update DOM and localStorage)
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (!textInput || !categoryInput) {
    alert("Add-quote form missing.");
    return;
  }

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  // add to array and persist
  quotes.push({ text, category });
  saveQuotes(quotes);

  // update category dropdown and show confirmation
  refreshCategoryOptions();
  quoteDisplay().innerHTML = `<p>✅ New quote added successfully!</p>`;

  // clear inputs
  textInput.value = "";
  categoryInput.value = "";
}

// --- createAddQuoteForm: required by tester — builds the input fields + add button dynamically
function createAddQuoteForm() {
  const container = addQuoteContainer();
  if (!container) return;

  container.innerHTML = ""; // ensure empty

  // Text input
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";
  textInput.style.width = "60%";
  textInput.style.marginRight = "8px";
  textInput.autocomplete = "off";

  // Category input
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.width = "25%";
  categoryInput.style.marginRight = "8px";
  categoryInput.autocomplete = "off";

  // Add button
  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
}

// --- Export quotes to a JSON file
function exportToJsonFile() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const fname = `quotes_export_${now.toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Could not export quotes: " + err.message);
  }
}

// --- Import quotes from a selected JSON file
function importFromJsonFile(event) {
  const file = (event && event.target && event.target.files && event.target.files[0]) || null;
  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error("Imported JSON must be an array of quotes.");
      // basic validation and normalization
      const valid = parsed.filter(item => item && typeof item.text === "string" && typeof item.category === "string")
                          .map(item => ({ text: item.text.trim(), category: item.category.trim() }));

      if (valid.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      // merge (avoid duplicates by text+category)
      const existingKeys = new Set(quotes.map(q => q.text + "||" + q.category));
      for (const q of valid) {
        const key = q.text + "||" + q.category;
        if (!existingKeys.has(key)) {
          quotes.push(q);
          existingKeys.add(key);
        }
      }

      saveQuotes(quotes);
      refreshCategoryOptions();
      quoteDisplay().innerHTML = `<p>✅ Imported ${valid.length} quotes (duplicates skipped).</p>`;
      // clear the file input so same file can be selected again if needed
      importFileInput().value = "";
    } catch (err) {
      alert("Failed to import JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// --- Initialization
function init() {
  // wire event listeners
  const newBtn = newQuoteBtn();
  if (newBtn) newBtn.addEventListener("click", showRandomQuote);

  const exportButton = exportBtn();
  if (exportButton) exportButton.addEventListener("click", exportToJsonFile);

  const importInput = importFileInput();
  if (importInput) importInput.addEventListener("change", importFromJsonFile);

  // create add-quote form (tester expects a createAddQuoteForm function that constructs the form)
  createAddQuoteForm();

  // populate categories and show last-viewed quote if exists
  refreshCategoryOptions();

  // show the last viewed quote from sessionStorage if available
  try {
    const last = sessionStorage.getItem(LAST_QUOTE_KEY);
    if (last) {
      const parsed = JSON.parse(last);
      if (parsed && parsed.text && parsed.category) {
        // show it
        quoteDisplay().innerHTML = `<p style="font-size:18px; margin:0 0 8px 0">"${escapeHtml(parsed.text)}"</p>
                                    <small>— ${escapeHtml(parsed.category)} (last viewed)</small>`;
      } else {
        showRandomQuote();
      }
    } else {
      showRandomQuote();
    }
  } catch (e) {
    showRandomQuote();
  }

  // filter change -> show a new quote from the selected category
  const filter = categoryFilter();
  if (filter) filter.addEventListener("change", showRandomQuote);
}

// run init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);

