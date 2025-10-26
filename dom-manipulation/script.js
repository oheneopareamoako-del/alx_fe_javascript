// script.js

// Initial quotes array
const quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
];

// DOM handles
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");

// Utility: refresh category dropdown options from quotes array
function refreshCategoryOptions() {
  const categories = new Set(quotes.map(q => q.category.trim()).filter(Boolean));
  // include "all"
  categoryFilter.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All";
  categoryFilter.appendChild(allOpt);

  Array.from(categories).sort().forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    categoryFilter.appendChild(o);
  });
}

// Function to show a random quote (respects filter)
function showRandomQuote() {
  let pool = quotes;
  const selectedCategory = categoryFilter.value;

  if (selectedCategory && selectedCategory !== "all") {
    pool = quotes.filter(q => q.category === selectedCategory);
  }

  if (pool.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes found for that category.</em>";
    return;
  }

  const idx = Math.floor(Math.random() * pool.length);
  const quote = pool[idx];

  // Build DOM
  quoteDisplay.innerHTML = "";

  const p = document.createElement("p");
  p.style.fontSize = "18px";
  p.style.margin = "0 0 8px 0";
  p.textContent = `"${quote.text}"`;

  const meta = document.createElement("div");
  meta.innerHTML = `<small>— ${quote.category}</small>`;

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(meta);
}

// Add a new quote from inputs
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });

  // clear inputs
  textInput.value = "";
  categoryInput.value = "";

  // update categories and show confirmation
  refreshCategoryOptions();
  quoteDisplay.innerHTML = "<p>✅ New quote added successfully!</p>";
}

// Init: wire events and populate category options
function init() {
  refreshCategoryOptions();
  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", addQuote);

  // show a sample quote on load
  showRandomQuote();

  // optional: show new quote when filter changes
  categoryFilter.addEventListener("change", showRandomQuote);
}

document.addEventListener("DOMContentLoaded", init);

