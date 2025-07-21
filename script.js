const users = {
  "Moch Sayce - Payment for Fines": "file:///C:/Users/al%20coreinee%20sayce/Downloads/LUMAY/y/bsed.png",
  "Moch Sayce": "Mochsayce1",
  "Jaye Manan": "77567885",
  "Trisha Krisbiene Batiancila": "file:///C:/Users/al%20coreinee%20sayce/Downloads/LUMAY/y/bsed.png",
  "Cyrelle Ignacio": "file:///C:/Users/al%20coreinee%20sayce/Downloads/LUMAY/y/bsed.png",
  "GGG555": "xiaoxiao"
};

let attempts = 0;
let isLocked = false;

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  if (isLocked) {
    document.getElementById("loginStatus").textContent = "Locked. Please wait 1 minute.";
    return;
  }

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (users[username] && users[username] === password) {
    // Success
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('menuSection').classList.remove('hidden');
    document.getElementById('loginStatus').textContent = '';
  } else {
    attempts++;
    document.getElementById('loginStatus').textContent = `Invalid credentials. (${5 - attempts} attempts left)`;
    if (attempts >= 5) {
      lockout();
    }
  }
});

function lockout() {
  isLocked = true;
  document.getElementById("lockoutTimer").classList.remove("hidden");
  document.getElementById("loginStatus").textContent = "Locked for 1 minute.";

  setTimeout(() => {
    attempts = 0;
    isLocked = false;
    document.getElementById("loginStatus").textContent = "";
    document.getElementById("lockoutTimer").classList.add("hidden");
  }, 60000);
}

// Manual start input logic (assumes ID is 'manualStartReceipt')
const manualInput = document.getElementById("manualStartReceipt");
if (manualInput) {
  manualInput.addEventListener("change", (e) => {
    const val = Number(e.target.value);
    if (val > 0) {
      localStorage.setItem("startReceipt", val);
      if (typeof updateTable === "function") updateTable();
    }
  });
}
