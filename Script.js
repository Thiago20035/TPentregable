const url = "https://api.restful-api.dev/objects";
    let localObjects = []; // Array para datos locales

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