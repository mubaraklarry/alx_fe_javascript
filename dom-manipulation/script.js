const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const SERVER_URL =
  "https://jsonplaceholder.typicode.com/posts";

let quotes = [];

/* ---------- STORAGE ---------- */

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Learning never stops.", category: "Education" },
      { text: "Discipline builds freedom.", category: "Life" },
      { text: "Consistency beats talent.", category: "Motivation" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/* ---------- DISPLAY ---------- */

function showRandomQuote() {
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));

  const p = document.createElement("p");
  p.textContent = quote.text + " (" + quote.category + ")";

  quoteDisplay.appendChild(p);
}

/* ---------- ADD QUOTE ---------- */

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories();
  filterQuotes();
}

/* ---------- CATEGORY FILTER ---------- */

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  categoryFilter.innerHTML =
    '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  localStorage.setItem("selectedCategory", selectedCategory);

  quoteDisplay.innerHTML = "";

  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(
      quote => quote.category === selectedCategory
    );
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent =
      "No quotes found for this category.";
    return;
  }

  filteredQuotes.forEach(quote => {
    const p = document.createElement("p");
    p.textContent = quote.text + " (" + quote.category + ")";
    quoteDisplay.appendChild(p);
  });
}

/* ---------- JSON EXPORT ---------- */

function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

/* ---------- JSON IMPORT ---------- */

function importFromJsonFile(event) {
  const reader = new FileReader();

  reader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
  };

  reader.readAsText(event.target.files[0]);
}

function fetchQuotesFromServer() {
  fetch(SERVER_URL)
    .then(response => response.json())
    .then(data => {
      const serverQuotes = data.slice(0, 5).map(item => {
        return {
          text: item.title,
          category: "Server"
        };
      });

      syncWithServer(serverQuotes);
    })
    .catch(() => {
      console.log("Server fetch failed");
    });
}
function syncWithServer(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(
      localQuote =>
        localQuote.text === serverQuote.text &&
        localQuote.category === serverQuote.category
    );

    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncNotification();
  }
}
function showSyncNotification() {
  let notice = document.getElementById("syncNotice");

  if (!notice) {
    notice = document.createElement("div");
    notice.id = "syncNotice";
    notice.textContent = "Quotes synced from server.";
    document.body.appendChild(notice);
  }

  setTimeout(() => {
    notice.remove();
  }, 3000);
}
setInterval(fetchQuotesFromServer, 30000);

/* ---------- INIT ---------- */

newQuoteBtn.addEventListener("click", showRandomQuote);

loadQuotes();
populateCategories();
filterQuotes();
fetchQuotesFromServer();
