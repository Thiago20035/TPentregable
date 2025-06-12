const url = "https://api.restful-api.dev/objects";
let localObjects = []; // Array para datos locales
/*
window.onload = function () {
  getObject();
};
*/
function getObject() {
  loadObject()
    .then(response => {
      const tbody = document.getElementById("tabla-telefonos");
      tbody.innerHTML = "";

      // Mostramos objetos desde la API
      response.forEach(obj => {
        insertTr(obj);
      });

      // Mostramos también objetos locales
      localObjects.forEach(obj => {
        insertTr(obj);
      });
    })
    .catch(error => {
      console.error("Error al cargar los datos:", error);
    });
}

function loadObject() {
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

function insertTr(object) {
  const tbody = document.getElementById("tabla-telefonos");
  const row = tbody.insertRow();
  row.setAttribute("id", object.id);

  row.insertCell().innerHTML = object.id;
  row.insertCell().innerHTML = object.name || "Sin nombre";
  row.insertCell().innerHTML = object.data?.color || "N/A";
  row.insertCell().innerHTML = object.data?.capacity || "N/A";

  const actions = row.insertCell();

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Eliminar";
  deleteBtn.onclick = () => deleteObject(object.id, row);

  const updateBtn = document.createElement("button");
  updateBtn.textContent = "Editar";
  updateBtn.onclick = () => updateObject(object);

  actions.appendChild(deleteBtn);
  actions.appendChild(updateBtn);
}

function addObject() {
  const name = prompt("Nombre del nuevo teléfono:");
  const color = prompt("Color:");
  const capacity = prompt("Capacidad:");

  if (!name || !color || !capacity) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const nuevoObjeto = {
    name: name,
    data: {
      color: color,
      capacity: capacity
    }
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoObjeto)
  })
    .then(res => res.json())
    .then(data => {
      localObjects.push(data); // lo guardamos localmente
      alert("Teléfono agregado.");
      getObject();
    })
    .catch(err => {
      console.error("Error al agregar:", err);
    });
}
/*
  // CREAR UN NUEVO OBJETO EN LA API USANDO XMLHttpRequest

  // Creamos el request
  const request = new XMLHttpRequest();

  // Abrimos la conexión con método POST y la URL de la API
  request.open("POST", url);

  // Indicamos que estamos mandando datos en formato JSON
  request.setRequestHeader("Content-Type", "application/json");

  // Esperamos la respuesta del servidor
  request.onload = function () {
    // Si todo salió bien (status 200 o 201)
    if (request.status === 200 || request.status === 201) {
      // Convertimos la respuesta (que es texto JSON) en un objeto JS
      const data = JSON.parse(request.responseText);

      // Lo agregamos al array local para mostrarlo
      localObjects.push(data);

      // Mostramos mensaje de éxito
      alert("Teléfono agregado.");

      // Actualizamos la tabla
      getObject();
    } else {
      // Si algo falló, mostramos error
      alert("Error al agregar teléfono.");
    }
  };

  // Si hay un error de red (no hay internet, por ejemplo)
  request.onerror = function () {
    console.error("Error de red al agregar.");
  };

  // Enviamos el nuevo objeto convertido a texto JSON
  request.send(JSON.stringify(nuevoObjeto));
*/


function updateObject(object) {
  const nuevoNombre = prompt("Nuevo nombre:", object.name);
  const nuevoColor = prompt("Nuevo color:", object.data?.color || "");
  const nuevaCapacidad = prompt("Nueva capacidad:", object.data?.capacity || "");

  if (!nuevoNombre || !nuevoColor || !nuevaCapacidad) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const actualizado = {
    name: nuevoNombre,
    data: {
      color: nuevoColor,
      capacity: nuevaCapacidad
    }
  };

  fetch(`${url}/${object.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actualizado)
  })
    .then(res => res.json())
    .then(updated => {
      // Remplazamos o agregamos en el array local
      const index = localObjects.findIndex(obj => obj.id === object.id);
      if (index >= 0) {
        localObjects[index] = updated;
      } else {
        localObjects.push(updated);
      }

      alert("Teléfono actualizado.");
      getObject();
    })
    .catch(error => {
      console.error("Error al actualizar:", error);
    });
}
/*
  // ACTUALIZAR UN OBJETO EXISTENTE USANDO XMLHttpRequest (sin fetch)

  // Creamos la petición
  const request = new XMLHttpRequest();

  // Abrimos la conexión con método PUT hacia la API y el ID del objeto a actualizar
  request.open("PUT", `${url}/${object.id}`);

  // Indicamos que estamos enviando datos JSON
  request.setRequestHeader("Content-Type", "application/json");

  // Esperamos la respuesta del servidor
  request.onload = function () {
    // Si el servidor respondió bien (200 o 201), procesamos
    if (request.status === 200 || request.status === 201) {
      // Convertimos la respuesta (texto) a objeto JS
      const updated = JSON.parse(request.responseText);

      // Buscamos si ya existe el objeto en el array local
      const index = localObjects.findIndex(obj => obj.id === object.id);

      // Si lo encontramos, lo reemplazamos
      if (index >= 0) {
        localObjects[index] = updated;
      } else {
        // Si no estaba, lo agregamos
        localObjects.push(updated);
      }

      // Mostramos alerta de éxito
      alert("Teléfono actualizado.");

      // Actualizamos la tabla
      getObject();
    } else {
      // Si hubo error del lado del servidor
      alert("Error al actualizar el teléfono.");
    }
  };

  // Si hay error de red (por ejemplo, sin internet)
  request.onerror = function () {
    console.error("Error de red al actualizar.");
  };

  // Enviamos el objeto actualizado convertido a JSON
  request.send(JSON.stringify(actualizado));
*/

function deleteObject(id, row) {
  if (!confirm("¿Seguro que querés eliminarlo?")) return;

  fetch(`${url}/${id}`, { method: "DELETE" })
    .then(response => {
      if (response.ok) {
        // Eliminamos también del array local
        localObjects = localObjects.filter(obj => obj.id !== id);
        row.remove();
        alert("Eliminado correctamente.");
      } else {
        alert("No se pudo eliminar.");
      }
    })
    .catch(error => {
      console.error("Error al eliminar:", error);
    });
}
/*
  // ELIMINAR UN OBJETO USANDO XMLHttpRequest (sin fetch)

  // Confirmamos con el usuario si realmente quiere eliminar
  if (!confirm("¿Seguro que querés eliminarlo?")) return;

  // Creamos el request
  const request = new XMLHttpRequest();

  // Abrimos la conexión con método DELETE y el ID del objeto a eliminar
  request.open("DELETE", `${url}/${id}`);

  // Esperamos la respuesta
  request.onload = function () {
    // Si fue exitoso (status 200 o 204), eliminamos localmente
    if (request.status === 200 || request.status === 204) {
      // Quitamos el objeto del array local
      localObjects = localObjects.filter(obj => obj.id !== id);

      // Quitamos la fila de la tabla
      row.remove();

      // Mostramos mensaje de éxito
      alert("Eliminado correctamente.");
    } else {
      // Si hubo problema del lado del servidor
      alert("No se pudo eliminar.");
    }
  };

  // Si hay error de red
  request.onerror = function () {
    console.error("Error de red al eliminar.");
  };

  // Enviamos la petición (no lleva body)
  request.send();
*/
