// Fetch quotes from server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.map(item => ({
      id: item.id,
      text: item.title,
      author: "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

// Post new quote to server (mock API)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
    const data = await response.json();
    console.log("Quote posted:", data);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// Sync quotes between local storage and server
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

    // Conflict resolution: merge server and local quotes (avoid duplicates)
    const mergedQuotes = [...localQuotes];
    serverQuotes.forEach(serverQuote => {
      if (!mergedQuotes.some(q => q.id === serverQuote.id)) {
        mergedQuotes.push(serverQuote);
      }
    });

    // Save merged quotes back to local storage
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));

    // ✅ Notify user after successful sync
    console.log("Quotes synced with server!");
    alert("Quotes synced with server!");
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Periodically check for updates (every 30 seconds)
setInterval(syncQuotes, 30000);

// Initial sync when page loads
syncQuotes();

