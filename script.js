function agregarHabito() {
    let habito = prompt("¿Qué hábito deseas agregar?");

    if (habito && habito.trim() !== "") {
        let lista = document.getElementById("listaHabitos");

        let nuevoHabito = document.createElement("li");

        nuevoHabito.textContent = habito.trim();
nuevoHabito.onclick = function() {
    marcarCompletado(this);
};

let botonEliminar = document.createElement("button");
botonEliminar.textContent = "Eliminar";
botonEliminar.onclick = function(event) {
    event.stopPropagation();
    eliminarHabito(nuevoHabito);
};
nuevoHabito.appendChild(botonEliminar);
        lista.appendChild(nuevoHabito);
let habitosGuardados = JSON.parse(localStorage.getItem("habitos")) || [];

habitosGuardados.push(habito.trim());

localStorage.setItem("habitos", JSON.stringify(habitosGuardados));

    }
}

window.addEventListener("DOMContentLoaded", function() {
    let habitosGuardados = JSON.parse(localStorage.getItem("habitos")) || [];
    let lista = document.getElementById("listaHabitos");

let completados = JSON.parse(
    localStorage.getItem("completados")
) || [];

    habitosGuardados.forEach(function(habito) {
        let nuevoHabito = document.createElement("li");
        nuevoHabito.textContent = habito;
        
if (completados.includes(habito)) {
    nuevoHabito.style.textDecoration = "line-through";
}

        nuevoHabito.onclick = function() {
    marcarCompletado(this);
};

let botonEliminar = document.createElement("button");

botonEliminar.textContent = "Eliminar";

botonEliminar.onclick = function(event) {
    event.stopPropagation();
    eliminarHabito(nuevoHabito);
};

nuevoHabito.appendChild(botonEliminar);
        lista.appendChild(nuevoHabito);
    });
});



function marcarCompletado(elemento) {
    let completado =
        elemento.style.textDecoration === "line-through";

    elemento.style.textDecoration =
        completado ? "none" : "line-through";

    let completados = JSON.parse(
        localStorage.getItem("completados")
    ) || [];

    let nombre = elemento.firstChild.textContent.trim();

    if (completado) {
        completados = completados.filter(
            habito => habito !== nombre
        );
    } else {
        if (!completados.includes(nombre)) {
            completados.push(nombre);
        }
    }

    localStorage.setItem(
        "completados",
        JSON.stringify(completados)

        
    );
}

function eliminarHabito(elemento) {
    let nombre = elemento.firstChild.textContent.trim();

    let habitosGuardados = JSON.parse(
    localStorage.getItem("habitos")
) || [];

habitosGuardados = habitosGuardados.filter(
    habito => habito !== nombre
);

localStorage.setItem(
    "habitos",
    JSON.stringify(habitosGuardados)
);

let completados = JSON.parse(
    localStorage.getItem("completados")
) || [];

completados = completados.filter(
    habito => habito !== nombre
);

localStorage.setItem(
    "completados",
    JSON.stringify(completados)
);

elemento.remove();
}
