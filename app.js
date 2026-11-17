// Remedy Setu - Order Tracker
// A simple internal tool to track orders from enquiry to delivery.
// There is no backend: all orders are saved in the browser's localStorage.

// Every order moves through these stages, in this order
const STAGES = ["Query", "Procurement", "Invoiced", "Dispatched", "Delivered"];

const STORAGE_KEY = "remedySetuOrders";

let orders = loadOrders();

// ---------- Saving and loading ----------

function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // First visit: start with some sample orders so the dashboard is not empty
  const samples = getSampleOrders();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function getSampleOrders() {
  const today = new Date().toISOString();
  return [
    { id: "ORD-1005", customer: "Acharya Vinod Mishra", phone: "9001122334", city: "Ujjain", items: "Navratna Ring x 1", amount: 9500, trackingId: "BD55128844", stage: "Delivered", createdAt: today },
    { id: "ORD-1004", customer: "Om Spiritual Store", phone: "9123456780", city: "Lucknow", items: "Yellow Sapphire (Pukhraj) 3 ratti x 1", amount: 18500, trackingId: "DTDC78451236", stage: "Dispatched", createdAt: today },
    { id: "ORD-1003", customer: "Anita Verma", phone: "9988776655", city: "Delhi", items: "Sphatik Mala x 20, Gomti Chakra x 50", amount: 6500, trackingId: "", stage: "Invoiced", createdAt: today },
    { id: "ORD-1002", customer: "Shubh Jyotish Kendra", phone: "9812345678", city: "Varanasi", items: "Neelam (Blue Sapphire) 5 ratti x 2", amount: 28000, trackingId: "", stage: "Procurement", createdAt: today },
    { id: "ORD-1001", customer: "Pandit Ramesh Sharma", phone: "9876543210", city: "Jaipur", items: "Rudraksha 5 Mukhi x 100", amount: 12000, trackingId: "", stage: "Query", createdAt: today }
  ];
}

// ---------- Helpers ----------

function findOrder(id) {
  return orders.find(order => order.id === id);
}

// Makes the next ID, e.g. ORD-1006 (biggest number used so far + 1)
function nextOrderId() {
  let max = 1000;
  orders.forEach(order => {
    const num = Number(order.id.replace("ORD-", ""));
    if (num > max) max = num;
  });
  return "ORD-" + (max + 1);
}

// Dispatched and Delivered orders must have a courier tracking ID
function needsTrackingId(stage) {
  return stage === "Dispatched" || stage === "Delivered";
}

function formatRupees(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// Stops text typed by the user from being treated as HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Add / Edit form ----------

const form = document.getElementById("order-form");
const stageSelect = document.getElementById("stage");
const stageFilter = document.getElementById("stage-filter");
const searchInput = document.getElementById("search");

// Fill both stage dropdowns from the STAGES list
STAGES.forEach(stage => {
  stageSelect.add(new Option(stage, stage));
  stageFilter.add(new Option(stage, stage));
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("order-id").value;
  const data = {
    customer: document.getElementById("customer").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value.trim(),
    items: document.getElementById("items").value.trim(),
    amount: Number(document.getElementById("amount").value),
    trackingId: document.getElementById("tracking").value.trim(),
    stage: stageSelect.value
  };

  if (needsTrackingId(data.stage) && !data.trackingId) {
    alert("Please enter the courier tracking ID for a " + data.stage + " order.");
    return;
  }

  if (id) {
    // Editing an existing order
    Object.assign(findOrder(id), data);
  } else {
    // New order goes on top of the list
    orders.unshift({ id: nextOrderId(), ...data, createdAt: new Date().toISOString() });
  }

  saveOrders();
  resetForm();
  render();
});

document.getElementById("cancel-btn").addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  document.getElementById("order-id").value = "";
  document.getElementById("form-title").textContent = "Add New Order";
  document.getElementById("save-btn").textContent = "Add Order";
  document.getElementById("cancel-btn").hidden = true;
}

function editOrder(id) {
  const order = findOrder(id);
  document.getElementById("order-id").value = order.id;
  document.getElementById("customer").value = order.customer;
  document.getElementById("phone").value = order.phone;
  document.getElementById("city").value = order.city;
  document.getElementById("items").value = order.items;
  document.getElementById("amount").value = order.amount;
  document.getElementById("tracking").value = order.trackingId;
  stageSelect.value = order.stage;

  document.getElementById("form-title").textContent = "Edit Order " + order.id;
  document.getElementById("save-btn").textContent = "Save Changes";
  document.getElementById("cancel-btn").hidden = false;
  form.scrollIntoView({ behavior: "smooth" });
}

// ---------- Order actions ----------

function moveToNextStage(id) {
  const order = findOrder(id);
  const nextStage = STAGES[STAGES.indexOf(order.stage) + 1];
  if (!nextStage) return; // already Delivered

  if (needsTrackingId(nextStage) && !order.trackingId) {
    const tracking = prompt("Enter the courier tracking ID for " + order.id + ":");
    if (!tracking || !tracking.trim()) return; // cancelled
    order.trackingId = tracking.trim();
  }

  order.stage = nextStage;
  saveOrders();
  render();
}

function deleteOrder(id) {
  if (!confirm("Delete order " + id + "?")) return;
  orders = orders.filter(order => order.id !== id);
  // If this order was open in the form, clear the form
  if (document.getElementById("order-id").value === id) resetForm();
  saveOrders();
  render();
}

// ---------- Showing data on the page ----------

function renderDashboard() {
  const box = document.getElementById("stage-cards");
  box.innerHTML = "";

  STAGES.forEach(stage => {
    const count = orders.filter(order => order.stage === stage).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "stage-card stage-" + stage.toLowerCase();
    if (stageFilter.value === stage) card.classList.add("active");
    card.innerHTML = '<span class="count">' + count + "</span>" + stage;
    // Clicking a card shows only that stage (click again to show all)
    card.addEventListener("click", () => {
      stageFilter.value = stageFilter.value === stage ? "" : stage;
      render();
    });
    box.appendChild(card);
  });

  const total = orders.reduce((sum, order) => sum + order.amount, 0);
  document.getElementById("summary").textContent =
    "Total orders: " + orders.length + "  |  Total value: " + formatRupees(total);
}

function renderOrders() {
  const list = document.getElementById("order-list");
  const search = searchInput.value.trim().toLowerCase();
  const stage = stageFilter.value;

  const filtered = orders.filter(order => {
    const text = [order.id, order.customer, order.phone, order.city, order.trackingId].join(" ").toLowerCase();
    return (!stage || order.stage === stage) && text.includes(search);
  });

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty">No orders found.</p>';
    return;
  }

  list.innerHTML = filtered.map(order => {
    const nextStage = STAGES[STAGES.indexOf(order.stage) + 1];
    return `
      <div class="order">
        <div class="order-top">
          <strong>${order.id}</strong>
          <span class="badge stage-${order.stage.toLowerCase()}">${order.stage}</span>
        </div>
        <p class="customer">${escapeHtml(order.customer)}</p>
        <p class="muted">${escapeHtml(order.phone)}${order.city ? " · " + escapeHtml(order.city) : ""}</p>
        <p>${escapeHtml(order.items)}</p>
        <p><b>${formatRupees(order.amount)}</b> · Tracking ID: ${order.trackingId ? escapeHtml(order.trackingId) : "–"}</p>
        <p class="muted">Created: ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
        <div class="actions">
          ${nextStage ? `<button onclick="moveToNextStage('${order.id}')">Move to ${nextStage} →</button>` : ""}
          <button class="secondary" onclick="editOrder('${order.id}')">Edit</button>
          <button class="danger" onclick="deleteOrder('${order.id}')">Delete</button>
        </div>
      </div>`;
  }).join("");
}

function render() {
  renderDashboard();
  renderOrders();
}

searchInput.addEventListener("input", renderOrders);
stageFilter.addEventListener("change", render);

document.getElementById("reset-btn").addEventListener("click", () => {
  if (!confirm("This will delete all orders and load the sample data again. Continue?")) return;
  orders = getSampleOrders();
  saveOrders();
  resetForm();
  render();
});

render();
