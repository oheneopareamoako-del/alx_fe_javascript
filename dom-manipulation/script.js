// Step 1: Load existing quotes or initialize
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" }
];

// Step 2: Helper - Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Step 3: Show random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));

  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>— ${randomQuote.category}</small>
  `;
}

// Step 4: Add new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();

  document.getElementById("quoteDisplay").innerHTML = `<p>✅ Quote added successfully!</p>`;
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Step 5: Create form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ✅ Step 6: Export to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ✅ Step 7: Import from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
// ====== CATEGORY FILTERING SYSTEM ======
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem('lastSelectedCategory');
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;
  const quoteDisplay = document.getElementById('quoteDisplay');

  localStorage.setItem('lastSelectedCategory', selectedCategory);

  const filteredQuotes =
    selectedCategory === 'all'
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomQuote =
      filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = `"${randomQuote.text}" - (${randomQuote.category})`;
  } else {
    quoteDisplay.textContent = 'No quotes found for this category.';
  }
}

// Step 8: Initialize app
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
createAddQuoteForm();
// === Export Quotes to JSON ===
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// === Import Quotes from JSON ===
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes(); // make sure you already have this function in your code
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
// === Import Quotes from JSON ===
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes(); // make sure you already have this defined
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
// === Step 9: Sync Quotes with Server ===
async function syncQuotes() {
  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

  try {
    // Fetch quotes from the "server"
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulate server quotes
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      author: `User ${item.userId}`
    }));

    // Get local quotes
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

    // Conflict resolution: server data takes precedence
    const mergedQuotes = [
      ...serverQuotes,
      ...localQuotes.filter(lq => !serverQuotes.some(sq => sq.text === lq.text))
    ];

    // Update local storage and in-memory data
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    quotes = mergedQuotes;

    // Notify user
    showSyncNotification("Quotes synced successfully! (Server data prioritized)");
  } catch (error) {
    console.error("Error syncing quotes:", error);
    showSyncNotification("Sync failed. Please check your connection.");
  }
}

// === Show sync notifications ===
function showSyncNotification(message) {
  const notice = document.createElement("div");
  notice.innerText = message;
  notice.style.position = "fixed";
  notice.style.bottom = "20px";
  notice.style.right = "20px";
  notice.style.background = "#333";
  notice.style.color = "#fff";
  notice.style.padding = "10px 20px";
  notice.style.borderRadius = "8px";
  notice.style.zIndex = "1000";
  document.body.appendChild(notice);

  setTimeout(() => {
    notice.remove();
  }, 4000);
}

// === Periodic sync every 30 seconds ===
setInterval(syncQuotes, 30000);

