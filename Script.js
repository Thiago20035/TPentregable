const url = "https://api.restful-api.dev/objects";
let localPhones = [];

window.onload = function () {
  getPhones();
};

let currentMode = ""; // "create" or "edit"
let editingPhone = null;

function getPhones() {
  loadPhones()
    .then(response => {
      const tbody = document.getElementById("phone-table");
      tbody.innerHTML = "";

      response.forEach(phone => {
        insertRow(phone);
      });

      localPhones.forEach(phone => {
        insertRow(phone);
      });
    })
    .catch(error => {
      console.error("Error loading data:", error);
    });
}

function loadPhones() {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.responseType = "json";
    request.onload = function () {
      request.status === 200
        ? resolve(request.response)
        : reject(Error(request.statusText));
    };
    request.onerror = () => reject(Error("Network error"));
    request.send();
  });
}

function insertRow(phone) {
  const tbody = document.getElementById("phone-table");
  const row = tbody.insertRow();
  row.setAttribute("id", phone.id);

  row.insertCell().innerHTML = phone.id;
  row.insertCell().innerHTML = phone.name || "No name";
  row.insertCell().innerHTML = phone.data?.color || "N/A";
  row.insertCell().innerHTML = phone.data?.capacity || "N/A";

  const actions = row.insertCell();

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deletePhone(phone.id, row);

  const editBtn = document.createElement("button");
  editBtn.className = "edit";
  editBtn.textContent = "Edit";
  editBtn.onclick = () => showModal('edit', phone);

  actions.appendChild(deleteBtn);
  actions.appendChild(editBtn);
}

function showModal(mode, phone = null) {
  currentMode = mode;
  editingPhone = phone;

  document.getElementById("modalTitle").textContent =
    mode === "create" ? "Add Phone" : "Edit Phone";

  document.getElementById("nameInput").value = phone?.name || "";
  document.getElementById("colorInput").value = phone?.data?.color || "";
  document.getElementById("capacityInput").value = phone?.data?.capacity || "";

  document.getElementById("modalOverlay").style.display = "block";
  document.getElementById("phoneModal").style.display = "block";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("phoneModal").style.display = "none";
}

function confirmModal() {
  const name = document.getElementById("nameInput").value;
  const color = document.getElementById("colorInput").value;
  const capacity = document.getElementById("capacityInput").value;

  if (!name || !color || !capacity) {
    alert("All fields are required.");
    return;
  }

  const newPhone = {
    name: name,
    data: {
      color: color,
      capacity: capacity
    }
  };

  if (currentMode === "create") {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPhone)
    })
      .then(res => res.json())
      .then(data => {
        localPhones.push(data);
        alert("Phone added.");
        getPhones();
        closeModal();
      })
      .catch(err => {
        console.error("Error adding phone:", err);
      });

  } else if (currentMode === "edit") {
    fetch(`${url}/${editingPhone.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPhone)
    })
      .then(res => res.json())
      .then(updated => {
        const index = localPhones.findIndex(p => p.id === editingPhone.id);
        if (index >= 0) {
          localPhones[index] = updated;
        } else {
          localPhones.push(updated);
        }
        alert("Phone updated.");
        getPhones();
        closeModal();
      })
      .catch(error => {
        console.error("Error updating phone:", error);
      });
  }
}

function deletePhone(id, row) {
  if (!confirm("Are you sure you want to delete this phone?")) return;

  fetch(`${url}/${id}`, { method: "DELETE" })
    .then(response => {
      if (response.ok || response.status === 405) {
        localPhones = localPhones.filter(p => p.id !== id);
        row.remove();
        alert("Phone deleted.");
      } else {
        alert("Could not delete the phone.");
      }
    })
    .catch(error => {
      console.error("Error deleting phone:", error);
    });
}
