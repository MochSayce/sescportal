let manualStartReceipt = parseInt(localStorage.getItem("startReceipt")) || 12631;
let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
let currentUser = localStorage.getItem("currentUser") || "Unknown";

let selectedYear = localStorage.getItem("selectedYear") || "1st";
let selectedMajor = localStorage.getItem("selectedMajor") || "Bio";
let names = JSON.parse(localStorage.getItem("names") || "[]");
let historyLog = JSON.parse(localStorage.getItem("transactionHistoryLog")) || [];

document.getElementById("welcomeMessage").textContent = `Welcome, ${currentUser}`;

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};

function logHistory(entry) {
  const logs = JSON.parse(localStorage.getItem("editDeleteHistory") || "[]");
  logs.push(entry);
  localStorage.setItem("editDeleteHistory", JSON.stringify(logs));
}

function renderYearButtons() {
  document.querySelectorAll("#yearButtons button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.year === selectedYear) btn.classList.add("active");
    btn.onclick = () => {
      selectedYear = btn.dataset.year;
      localStorage.setItem("selectedYear", selectedYear);
      renderYearButtons();
    };
  });
}

function renderMajorButtons() {
  document.querySelectorAll("#majorButtons button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.major === selectedMajor) btn.classList.add("active");
    btn.onclick = () => {
      selectedMajor = btn.dataset.major;
      localStorage.setItem("selectedMajor", selectedMajor);
      renderMajorButtons();
    };
  });
}

function updateSuggestions() {
  const datalist = document.getElementById("nameSuggestions");
  datalist.innerHTML = "";
  names.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
  });
}

function getNextReceiptNumber() {
  const savedStart = parseInt(localStorage.getItem("startReceipt")) || 12631;
  const maxReceipt = transactions.length > 0 ? Math.max(...transactions.map(t => t.receipt)) : 0;
  return Math.max(savedStart, maxReceipt + 1);
}




function updateTable() {
  const tbody = document.getElementById("transactionTableBody");
  const search = document.getElementById("searchHistory").value.toLowerCase();
  const filterMajor = document.getElementById("filterMajor").value;
  tbody.innerHTML = "";

  let filtered = transactions.filter(t =>
    t.name.toLowerCase().includes(search) &&
    (!filterMajor || t.major === filterMajor)
  );

  let total = 0;

  filtered.forEach((t, i) => {
    total += Number(t.amount);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.receipt}</td>
      <td>${t.name}</td>
      <td>${t.year}</td>
      <td>${t.major}</td>
      <td>₱${t.amount}</td>
      <td>${new Date(t.timestamp).toLocaleString()}</td>
      <td>${t.editCount || 0}</td>
      <td>${t.createdBy}</td>
      <td>
        <button onclick="editTransaction(${t.receipt})">Edit</button>
        <button onclick="deleteTransaction(${t.receipt})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalAmount").textContent = total;
  document.getElementById("receiptNumber").value = getNextReceiptNumber();
}
document.getElementById("setStartBtn").onclick = () => {
  const newStart = parseInt(document.getElementById("manualStartReceipt").value);
  if (isNaN(newStart) || newStart <= 0) {
    alert("Please enter a valid starting number.");
    return;
  }

  localStorage.setItem("startReceipt", newStart);
  manualStartReceipt = newStart;
  alert(`Start receipt number updated to ${newStart}.`);

  // Refresh the next available receipt number
  document.getElementById("receiptNumber").value = getNextReceiptNumber();
};

const manualStartReceiptInput = document.getElementById("manualStartReceipt");
if (manualStartReceiptInput) {
  manualStartReceiptInput.value = manualStartReceipt;
}
document.getElementById("receiptNumber").value = getNextReceiptNumber();


document.getElementById("suggestedAmount").onclick = () => {
  document.getElementById("amountInput").value = 400;
};

document.getElementById("transactionForm").onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById("nameInput").value.trim();
  const amount = document.getElementById("amountInput").value;
  const receipt = getNextReceiptNumber();

  if (!name || !amount) return;

  const newT = {
    receipt,
    name,
    year: selectedYear,
    major: selectedMajor,
    amount,
    timestamp: new Date().toISOString(),
    createdBy: currentUser,
    editCount: 0,
    editHistory: []
  };

  transactions.push(newT);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTable();
  document.getElementById("transactionForm").reset();
};

function editTransaction(receipt) {
  const t = transactions.find(tx => tx.receipt === receipt);
  const newAmount = prompt("Enter new amount", t.amount);
  if (newAmount !== null) {
    t.editHistory = t.editHistory || [];
    t.editHistory.push({
      oldAmount: t.amount,
      newAmount,
      editedAt: new Date().toISOString()
    });
    t.amount = newAmount;
    t.editCount = (t.editCount || 0) + 1;
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateTable();
  }
  historyLog.push({
  type: "edit",
  receipt: t.receipt,
  editedBy: currentUser,
  time: new Date().toLocaleString(),
  changes: {
    old: { ...t },
    new: { ...updatedTransaction }
  }
});
localStorage.setItem("transactionHistoryLog", JSON.stringify(historyLog));
if (updatedAmount !== oldAmount) {
  logHistory({
    type: "Edited",
    receipt: transaction.receipt,
    field: "Amount",
    oldValue: oldAmount,
    newValue: updatedAmount,
    user: currentUser,
    time: new Date().toLocaleString()
  });
  transaction.amount = updatedAmount;
}

}

function deleteTransaction(receipt) {
  const index = transactions.findIndex(t => t.receipt === receipt);
  if (index !== -1) {
    const deleted = transactions[index];

    logHistory({
      type: "Deleted",
      receipt: deleted.receipt,
      field: "-",
      oldValue: JSON.stringify(deleted),
      newValue: "-",
      user: currentUser,
      time: new Date().toLocaleString()
    });

    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateTable();
  }
}


document.getElementById("importNamesBtn").onclick = () => {
  document.getElementById("nameFileInput").click();
};

document.getElementById("nameFileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const lines = evt.target.result.split("\n").map(l => l.trim()).filter(l => l);
    names.push(...lines);
    names = [...new Set(names)];
    localStorage.setItem("names", JSON.stringify(names));
    updateSuggestions();
  };
  reader.readAsText(file);
});

document.getElementById("namePasteInput").addEventListener("blur", () => {
  const pasted = document.getElementById("namePasteInput").value.split("\n").map(l => l.trim()).filter(l => l);
  names.push(...pasted);
  names = [...new Set(names)];
  localStorage.setItem("names", JSON.stringify(names));
  updateSuggestions();
});

document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(transactions)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.json";
  a.click();
};

document.getElementById("importFileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      transactions.push(...imported);
      transactions = [...new Map(transactions.map(t => [t.receipt, t])).values()];
      localStorage.setItem("transactions", JSON.stringify(transactions));
      updateTable();
    } catch {
      alert("Invalid file format");
    }
  };
  reader.readAsText(file);
});

document.getElementById("searchHistory").addEventListener("input", updateTable);
document.getElementById("filterMajor").addEventListener("change", updateTable);

function sortBy(field) {
  transactions.sort((a, b) => a[field] - b[field]);
  updateTable();
}

renderYearButtons();
renderMajorButtons();
updateSuggestions();
updateTable();

if (transaction.user === currentUser) {
  actionCell.innerHTML = `
    <button onclick="editTransaction(${index})">Edit</button>
    <button onclick="deleteTransaction(${index})">Delete</button>
  `;
} else {
  actionCell.innerHTML = `<span style="color:gray;">No Access</span>`;
}

