const ctx = document.getElementById("transactionChart").getContext("2d");

let chart; // Global chart reference
const colors = {
  Math: "#7ddf64",       // green
  Bio: "#5B5AA4",        // indigo
  Filo: "#FF9DAE",       // pink
  Eng: "#800000",        // maroon
  default: "#A694FF"
};

function loadTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  return transactions;
}

function applyFilters(transactions) {
  const year = document.getElementById("filter-year").value;
  const major = document.getElementById("filter-major").value;

  return transactions.filter(tx => {
    const yearMatch = year === "all" || tx.year === year;
    const majorMatch = major === "all" || tx.major === major;
    return yearMatch && majorMatch;
  });
}

function groupData(transactions, type) {
  const result = {};
  transactions.forEach(tx => {
    const key = tx.major || "Unknown";
    if (!result[key]) result[key] = { amount: 0, count: 0 };
    result[key].amount += parseFloat(tx.amount);
    result[key].count += 1;
  });

  const labels = Object.keys(result);
  const data = labels.map(label => type === "amount" ? result[label].amount : result[label].count);
  const bgColors = labels.map(label => colors[label] || colors.default);

  return { labels, data, bgColors };
}

function updateChart() {
  const allTx = loadTransactions();
  const filtered = applyFilters(allTx);
  const chartType = document.getElementById("chart-type").value;

  // You can switch between "amount" and "count" here
  const { labels, data, bgColors } = groupData(filtered, chartType === "line" ? "count" : "amount");

  if (chart) chart.destroy(); // Reset chart

  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [{
        label: chartType === "line" ? "Number of Transactions" : "Amount Paid",
        data,
        backgroundColor: bgColors,
        borderColor: "#1A1A40",
        borderWidth: 1,
        fill: chartType === "line"
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: chartType !== "bar" }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#1A1A40"
          }
        },
        x: {
          ticks: {
            color: "#1A1A40"
          }
        }
      }
    }
  });

  // Update subtotal and count
  const totalAmount = filtered.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
  document.getElementById("subtotal").textContent = `₱${totalAmount.toFixed(2)}`;
  document.getElementById("txCount").textContent = `${filtered.length}`;
}

// Event listeners
document.getElementById("filter-year").addEventListener("change", updateChart);
document.getElementById("filter-major").addEventListener("change", updateChart);
document.getElementById("chart-type").addEventListener("change", updateChart);

// Initial load
updateChart();
