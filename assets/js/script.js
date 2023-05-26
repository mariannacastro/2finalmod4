//! VARIABLES y SELECTORES
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");

//! EVENTOS
eventListeners();

function eventListeners() {
    //al cargar todo el proyecto solicita el presupuesto
    document.addEventListener("DOMContentLoaded", consultarPresupuesto);

    document.addEventListener("submit", agregarGasto);
}
//! CLASSES
class Presupuesto {
    //
    constructor(presupuesto) {
        // Number -> convierste cualquier numero que sea string a number
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    //metodo para crear un nuevo gasto y luego anadir ese gasto al HTML
    nuevoGasto(gasto) {
        //agregamos a la propiedad gasto(array) el gasto que recibimos del formulario
        this.gastos = [...this.gastos, gasto];
        //mandamos llamar a calcularRestante cada vez que se gener un nuevo gasto
        this.calcularRestante();
        // console.log("objeto gasto", this.gastos);
    }

    //calcularRestante
    calcularRestante() {
        //obtener cuanto dinero tenemos gastado
        // iteramos sobre el objeto de gasto, y utilizamos array metod ->reduce() para calcular cuando dinero hemos gastado
        // reduce: 1er parametro(total, acumulado), 2do(objeto actual que se sumara) -> valor inicial 0
        const gastado = this.gastos.reduce(
            (total, gasto) => total + gasto.cantidad,
            0
        );

        this.restante = this.presupuesto - gastado;
        console.log("llevamos gastado", gastado, "restante", this.restante);
    }

    eliminarGasto(id) {
        // filtramos (itera el array gastos) y traemos todos los elementos menos el id que estamos recibiendo ( ya que es este el que queremos eliminar)
        this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
        //mandamos llamar a calcularRestante cada vez que se elimine un nuevo gasto
        this.calcularRestante();
        console.log(this.gastos);
    }
}

class UI {
    insertarPrespuesto(cantidad) {
        //Se extraen los valores
        const { presupuesto, restante } = cantidad;

        //se agrega en el HTML
        document.querySelector("#total").textContent = presupuesto;
        document.querySelector("#restante").textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {
        //Se crear el elemento DIV para insertar en el HTML
        const divMensaje = document.createElement("div");
        divMensaje.classList.add("text-center", "alert");

        // valida el TIPO de error para mostrar un estilo de mensaje
        if (tipo === "error") {
            divMensaje.classList.add("alert-danger"); //agregamos el estilo alert-danger
        } else {
            divMensaje.classList.add("alert-success");
        }

        // asignamos el mensaje  a nuestro elemento DIV
        divMensaje.textContent = mensaje;

        //insertamos el DIV en el HTML
        document.querySelector(".primario").insertBefore(divMensaje, formulario);

        //quitar la alerta del HTML luego de 3seg
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos(gasto) {
        // elimina el HTML previo
        this.limpiarHTMl();
        // iterar sobre los gastos
        gasto.forEach((gasto) => {
            const { cantidad, nombre, id } = gasto;

            // crear un elemento LI
            const nuevoGasto = document.createElement("li");
            nuevoGasto.className =
                "list-group-item d-flex justify-content-between align-items-center";
            nuevoGasto.dataset.id = id;

            // agregar el HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class='badge badge-primary' badge-pill> $ ${cantidad} </span>`;

            // Botón para borrar el gasto
            const btnBorrar = document.createElement("button");
            btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
            btnBorrar.innerHTML = "borra &times";
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            };
            nuevoGasto.appendChild(btnBorrar);

            // Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHTMl() {
        //seleccionamos el primer nodo de nuestro listado de gasto definido en la cabecera
        while (gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        //asiganamos al HTML el valor que recibimos de restante
        document.querySelector("#restante").textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        //destructuración de objeto
        const { presupuesto, restante } = presupuestoObj;

        const restanteDiv = document.querySelector(".restante");

        //Si el gasto es más del 75%, aparece estilo 'alert-danger'
        if (presupuesto / 4 > restante) {
            restanteDiv.classList.remove("alert-success", "alert-warning");
            restanteDiv.classList.add("alert-danger");
        } else if (presupuesto / 2 > restante) {
            //Si el gasto es más del 50%, le damos estilo 'alert-warning'
            restanteDiv.classList.remove("alert-success");
            restanteDiv.classList.add("alert-warning");
        } else {
            //Se comprueba el reembolso (osea cuando se elimina un gasto) 
            restanteDiv.classList.remove("alert-danger", "alert-warning");
            restanteDiv.classList.add("alert-success");
        }

        // si el total es 0 o menor
        if (restante <= 0) {
            ui.imprimirAlerta("el presupuesto se ha agotado", "error");

            // Se desactiva el boton de agregar
            formulario.querySelector("button[type='submit']").disabled = true;
        }
    }
}

const ui = new UI();
let presupuesto;

function consultarPresupuesto() {
    const presupuestoTotal = prompt("Ingresa tu presupuesto aquí:");

    //validar prompt
    if (
        presupuestoTotal === "" ||
        presupuestoTotal === null ||
        isNaN(presupuestoTotal) ||
        presupuestoTotal <= 0
    ) {
        window.location.reload();
    }

    // Se obtiene presupuesto
    presupuesto = new Presupuesto(presupuestoTotal);
    console.log(presupuesto);

    ui.insertarPrespuesto(presupuesto);
}


function agregarGasto(e) {
    e.preventDefault();

    const nombre = document.querySelector("#gasto").value;
    const cantidad = Number(document.querySelector("#cantidad").value);


    if (nombre === "" || cantidad === "") {
        ui.imprimirAlerta("Ambos campos son obligatorios", "error");
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta("cantidad no valida", "error");
        return;
    }

    const gasto = { nombre, cantidad, id: Date.now() };

    presupuesto.nuevoGasto(gasto);

    ui.imprimirAlerta("gasto agregado correctamente");

    // Se listan los gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    formulario.reset();
}

function eliminarGasto(id) {
    presupuesto.eliminarGasto(id);
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}