// URL de la API REST para gestionar objetos (teléfonos)
const url = "https://api.restful-api.dev/objects";

// Array local para almacenar teléfonos creados o modificados
let localPhones = [];

// Variables para controlar el estado del modal
let currentMode = ""; // Puede ser "create" o "edit"
let editingPhone = null; // Almacena el teléfono que se está editando

// Se ejecuta cuando la página termina de cargar completamente
// Llama a getPhones() para inicializar la aplicación con los datos
window.onload = function () {
  getPhones();
};

// Función principal que obtiene y muestra todos los teléfonos en la tabla
// Primero carga los de la API, después los que están guardados localmente
function getPhones() {
  loadPhones()
    .then(response => {
      // Limpiar la tabla antes de mostrar los datos
      const tbody = document.getElementById("phone-table");
      tbody.innerHTML = "";

      // Mostrar teléfonos de la API
      response.forEach(phone => {
        insertRow(phone);
      });

      // Mostrar teléfonos almacenados localmente
      localPhones.forEach(phone => {
        insertRow(phone);
      });
    })
    .catch(error => {
      console.error("Error loading data:", error);
    });
}

// Realiza una petición GET a la API para obtener todos los teléfonos
// Devuelve una promesa que resuelve con la lista de teléfonos
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

// Realiza una petición POST a la API para crear un nuevo teléfono
// Recibe los datos del teléfono y devuelve una promesa con el teléfono creado
function createPhone(phoneData) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = "json";
    
    request.onload = function () {
      // Acepta tanto 200 como 201 (Created)
      request.status === 200 || request.status === 201
        ? resolve(request.response)
        : reject(Error(request.statusText));
    };
    
    request.onerror = () => reject(Error("Network error"));
    request.send(JSON.stringify(phoneData));
  });
}

// Realiza una petición PUT a la API para actualizar un teléfono existente
// Recibe el ID del teléfono y los nuevos datos, devuelve una promesa
function updatePhone(id, phoneData) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", `${url}/${id}`);
    request.setRequestHeader("Content-Type", "application/json");
    request.responseType = "json";
    
    request.onload = function () {
      request.status === 200
        ? resolve(request.response)
        : reject(Error(request.statusText));
    };
    
    request.onerror = () => reject(Error("Network error"));
    request.send(JSON.stringify(phoneData));
  });
}

// Realiza una petición DELETE a la API para eliminar un teléfono
// Recibe el ID del teléfono a eliminar y devuelve una promesa
function deletePhoneAPI(id) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("DELETE", `${url}/${id}`);
    
    request.onload = function () {
      // Acepta 200 (OK) y 405 (Method Not Allowed) para compatibilidad
      request.status === 200 || request.status === 405
        ? resolve(request.response)
        : reject(Error(request.statusText));
    };
    
    request.onerror = () => reject(Error("Network error"));
    request.send();
  });
}

// Inserta una nueva fila en la tabla con los datos del teléfono
// Recibe un objeto teléfono y crea una fila completa con botones de acción
function insertRow(phone) {
  const tbody = document.getElementById("phone-table");
  const row = tbody.insertRow();
  row.setAttribute("id", phone.id);

  // Insertar celdas con los datos del teléfono
  row.insertCell().innerHTML = phone.id;
  row.insertCell().innerHTML = phone.name || "No name";
  row.insertCell().innerHTML = phone.data?.color || "N/A";
  row.insertCell().innerHTML = phone.data?.capacity || "N/A";

  // Crear celda de acciones con botones
  const actions = row.insertCell();

  // Botón de eliminar
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deletePhone(phone.id, row);

  // Botón de editar
  const editBtn = document.createElement("button");
  editBtn.className = "edit";
  editBtn.textContent = "Edit";
  editBtn.onclick = () => showModal('edit', phone);

  actions.appendChild(deleteBtn);
  actions.appendChild(editBtn);
}

// Muestra el modal para crear o editar un teléfono
// Recibe el modo ("create" o "edit") y opcionalmente los datos del teléfono
function showModal(mode, phone = null) {
  currentMode = mode;
  editingPhone = phone;

  // Configurar título del modal
  document.getElementById("modalTitle").textContent =
    mode === "create" ? "Add Phone" : "Edit Phone";

  // Rellenar campos del formulario
  document.getElementById("nameInput").value = phone?.name || "";
  document.getElementById("colorInput").value = phone?.data?.color || "";
  document.getElementById("capacityInput").value = phone?.data?.capacity || "";

  // Mostrar modal
  document.getElementById("modalOverlay").style.display = "block";
  document.getElementById("phoneModal").style.display = "block";
}

// Oculta el modal de crear/editar teléfono
function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("phoneModal").style.display = "none";
}

// Confirma la acción del modal (crear o editar teléfono)
// Valida los campos del formulario y ejecuta la operación correspondiente
function confirmModal() {
  // Obtener valores del formulario
  const name = document.getElementById("nameInput").value;
  const color = document.getElementById("colorInput").value;
  const capacity = document.getElementById("capacityInput").value;

  // Validar que todos los campos estén llenos
  if (!name || !color || !capacity) {
    alert("All fields are required.");
    return;
  }

  // Crear objeto con los datos del teléfono
  const newPhone = {
    name: name,
    data: {
      color: color,
      capacity: capacity
    }
  };

  // Ejecutar acción según el modo actual
  if (currentMode === "create") {
    // Crear nuevo teléfono
    createPhone(newPhone)
      .then(data => {
        localPhones.push(data);
        alert("Phone added.");
        getPhones(); // Refrescar la tabla
        closeModal();
      })
      .catch(error => {
        console.error("Error adding phone:", error);
        alert("Error adding phone");
      });

  } else if (currentMode === "edit") {
    // Actualizar teléfono existente
    updatePhone(editingPhone.id, newPhone)
      .then(updated => {
        // Actualizar en el array local si existe
        const index = localPhones.findIndex(p => p.id === editingPhone.id);
        if (index >= 0) {
          localPhones[index] = updated;
        } else {
          localPhones.push(updated);
        }
        alert("Phone updated.");
        getPhones(); // Refrescar la tabla
        closeModal();
      })
      .catch(error => {
        console.error("Error updating phone:", error);
        alert("Error updating phone");
      });
  }
}

// Elimina un teléfono después de confirmar la acción
// Recibe el ID del teléfono y la fila de la tabla para eliminarlos
function deletePhone(id, row) {
  // Confirmar antes de eliminar
  if (!confirm("Are you sure you want to delete this phone?")) return;

  deletePhoneAPI(id)
    .then(() => {
      // Eliminar del array local
      localPhones = localPhones.filter(p => p.id !== id);
      // Eliminar fila de la tabla
      row.remove();
      alert("Phone deleted.");
    })
    .catch(error => {
      console.error("Error deleting phone:", error);
      alert("Error deleting phone");
    });
}