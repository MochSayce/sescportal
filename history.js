const historyTable = document.getElementById("historyTable").querySelector("tbody");
const validUsers = {
  "admin1234": "pass1234",
  "Olaf": "Anna",
  "Elsa": "Frozen"
};

// Load history from localStorage
const logs = JSON.parse(localStorage.getItem("editDeleteHistory") || "[]");

logs.forEach(log => {
  const row = historyTable.insertRow();
  row.innerHTML = `
    <td>${log.type}</td>
    <td>${log.receipt}</td>
    <td>${log.field || "-"}</td>
    <td>${log.oldValue || "-"}</td>
    <td>${log.newValue || "-"}</td>
    <td>${log.user}</td>
    <td>${log.time}</td>
  `;
});

function clearHistory() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (validUsers[user] === pass) {
    if (confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem("editDeleteHistory");
      location.reload();
    }
  } else {
    alert("Invalid username or password.");
  }
}

function exportHistory() {
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "history-log.json";
  link.click();
}
