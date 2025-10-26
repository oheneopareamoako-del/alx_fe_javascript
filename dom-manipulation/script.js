// script.js

// Step 1: Quotes array
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" }
];

// Step 2: Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Update the DOM
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>— ${randomQuote.category}</small>
  `;
}

// Step 3: Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Add new quote to array
  quotes.push({
    text: newQuoteText,
    category: newQuoteCategory
  });

  // Update DOM to show confirmation
  quoteDisplay.innerHTML = `<p>✅ New quote added successfully!</p>`;

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ✅ Step 4: Function to create and attach the Add Quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  // Create input for quote text
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  // Create input for category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  // Create Add button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  // Append all to form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Add to body (or a specific section)
  document.body.appendChild(formContainer);
}

// Step 5: Event listener for "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Step 6: Initialize the app
createAddQuoteForm();

