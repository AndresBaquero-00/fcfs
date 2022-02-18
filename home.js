// Botones
var btnEnviar = document.querySelector('#enviar');
var btnEjecutar = document.querySelector('#ejecutar');
var btnEnviarEjecutar = document.querySelector('#enviar-ejecutar');
var btnReanudar = document.querySelector('#reanudar');
var btnBloquear = document.querySelector('#bloquear');
// Campos de Texto
var txtProceso = document.querySelector('#nombre-proceso');
var txtLlegada = document.querySelector('#tiempo-llegada');
var txtRafaga = document.querySelector('#rafaga');
// Contenedores
var divRojo = document.querySelector('#rojo');
var divVerde = document.querySelector('#verde');
var table = document.querySelector('#table');
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
/**
 * Array que guarda los procesos en una cola de espera.
 */
var procesos = [];
/**
 * Contador de procesos.
 */
var i = 0;
/**
* Determina si la sección crítica ejecuta procesos en tiempo real o en bloque.
*/
var ejecutar = false;
/**
* Almacena un estado si la sección crítica cambia de proceso y hay más procesos en la lista de espera.
*/
var hayProcesos = false;
/**
 * Contador de colores.
 */
var cont = 0;
/**
 * Array que almacena los colores que se van a usar para dibujar cada proceso en el diagrama.
 */
var colores = ['red', 'green', 'blue', 'orange', '#7D3C98', 'black'];
/**
 * Función que setea la sección crítica a estado ocupado.
 */
var busy = function () {
    divVerde.className = 'verde-inactivo';
    divRojo.className = 'rojo-activo';
};
/**
 * Función que setea la sección crítica a estado desocupado.
 */
var free = function () {
    divVerde.className = 'verde-activo';
    divRojo.className = 'rojo-inactivo';
};
/**
 * Función que permite visualizar el cambio de estado de la sección crítica.
 */
var change = function () {
    hayProcesos = false;
    free();
    if (i < procesos.length) {
        setTimeout(function () { hayProcesos = true; }, 1000);
    }
};
/**
 *
 * @param uProceso El ultimo proceso en la cola.
 * @returns El nuevo proceso que está en la lista de espera.
 */
var crearProceso = function (uProceso) {
    var proceso = {
        nombre: txtProceso.value,
        tiempo_llegada: parseInt(txtLlegada.value),
        rafaga: parseInt(txtRafaga.value),
        tiempo_ejecutado: 0,
        index: procesos.length,
        bloqueo: {
            tiempo_block: 0,
            estado_block: false
        }
    };
    if (procesos.length === 0) {
        proceso.tiempo_comienzo = proceso.tiempo_llegada;
    }
    else {
        proceso.tiempo_comienzo = uProceso.tiempo_final >= proceso.tiempo_llegada ? uProceso.tiempo_final : proceso.tiempo_llegada;
    }
    proceso.tiempo_final = proceso.rafaga + proceso.tiempo_comienzo;
    proceso.tiempo_retorno = proceso.tiempo_final - proceso.tiempo_llegada;
    proceso.tiempo_espera = proceso.tiempo_retorno - proceso.rafaga;
    proceso.bloqueo.tiempo_inicio = proceso.tiempo_comienzo;
    return proceso;
};
/**
 * Función que agrega el proceso en ejecución a la tabla de procesos ejecutados.
 * @param proceso
 */
var registrarProceso = function (proceso) {
    table.children[1].innerHTML +=
        "<tr>\n            <td>".concat(proceso.nombre, "</td>\n            <td>").concat(proceso.tiempo_llegada, "</td>\n            <td>").concat(proceso.rafaga, "</td>\n            <td>").concat(proceso.tiempo_comienzo, "</td>\n            <td>").concat(proceso.tiempo_final, "</td>\n            <td>").concat(proceso.tiempo_retorno, "</td>\n            <td>").concat(proceso.tiempo_espera + proceso.bloqueo.tiempo_block, "</td>\n        </tr>");
};
/**
 * Función que dibuja la recta asociada a cada proceso en el canvas.
 * @param proceso
 */
var dibujarProceso = function (proceso) {
    if (cont === colores.length) {
        cont = 0;
    }
    ctx.strokeStyle = colores[cont];
    cont++;
    /* Dibuja tiempo de llegada */
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tiempo_llegada * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + proceso.tiempo_llegada * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja tiempo de comienzo */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tiempo_comienzo * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + proceso.tiempo_comienzo * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja tiempo de inicio bloqueo */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.bloqueo.tiempo_inicio * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + proceso.bloqueo.tiempo_inicio * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja tiempo final bloqueo */
    ctx.beginPath();
    ctx.moveTo(2 + (proceso.bloqueo.tiempo_inicio + proceso.bloqueo.tiempo_block) * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + (proceso.bloqueo.tiempo_inicio + proceso.bloqueo.tiempo_block) * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja tiempo final */
    ctx.beginPath();
    ctx.moveTo(2 + (proceso.tiempo_final + proceso.bloqueo.tiempo_block) * 10, 2 + 35 * (i + 1));
    ctx.lineTo(2 + (proceso.tiempo_final + proceso.bloqueo.tiempo_block) * 10, 13 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja linea desde tiempo de comienzo hasta tiempo de inicio bloqueo */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tiempo_comienzo * 10, 7.5 + 35 * (i + 1));
    ctx.lineTo(2 + proceso.bloqueo.tiempo_inicio * 10, 7.5 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja linea desde tiempo de comienzo hasta tiempo de inicio bloqueo */
    ctx.beginPath();
    ctx.moveTo(2 + (proceso.bloqueo.tiempo_inicio + proceso.bloqueo.tiempo_block) * 10, 7.5 + 35 * (i + 1));
    ctx.lineTo(2 + (proceso.tiempo_final + proceso.bloqueo.tiempo_block) * 10, 7.5 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja linea desde tiempo de llegada hasta tiempo de comienzo */
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tiempo_llegada * 10, 7.5 + 35 * (i + 1));
    ctx.lineTo(2 + proceso.tiempo_comienzo * 10, 7.5 + 35 * (i + 1));
    ctx.stroke();
    /* Dibuja linea desde tiempo de inicio bloqueo hasta tiempo final bloqueo */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.bloqueo.tiempo_inicio * 10, 7.5 + 35 * (i + 1));
    ctx.lineTo(2 + (proceso.bloqueo.tiempo_inicio + proceso.bloqueo.tiempo_block) * 10, 7.5 + 35 * (i + 1));
    ctx.stroke();
};
/**
 * Funcion que permite agregar un proceso a la cola de espera.
 */
var enviarProceso = function () {
    var uProceso = procesos.filter(function (p) {
        if (p.index + 1 === procesos.length) {
            return p;
        }
    })[0];
    var proceso = crearProceso(uProceso);
    if (!proceso.nombre || isNaN(proceso.tiempo_llegada) || isNaN(proceso.rafaga)) {
        alert('No se admiten campos vacíos. Intente nuevamente.');
        return;
    }
    if (uProceso && proceso.tiempo_llegada < uProceso.tiempo_llegada) {
        alert("El tiempo del proceso ".concat(proceso.nombre, " debe ser mayor o igual a ").concat(uProceso.tiempo_llegada));
        return;
    }
    procesos.push(proceso);
    txtProceso.value = '';
    txtLlegada.value = '';
    txtRafaga.value = '';
    ejecutar = false;
    hayProcesos = true;
};
/**
 * Función que se encarga de ejecutar los procesos que están actualmente en la cola de espera.
 */
var ejecutarProceso = function () {
    ejecutar = true;
};
/**
 * Función que se encarga de agregar un nuevo proceso a la cola de espera en tiempo de ejecución.
 */
var enviarEjecutarProceso = function () {
    enviarProceso();
    ejecutarProceso();
};
/**
 * Función encargada de bloquear un proceso.
 */
var bloquearProceso = function () {
    if (i === procesos.length) {
        return;
    }
    procesos[i].bloqueo.estado_block = true;
    procesos[i].bloqueo.tiempo_inicio = procesos[i].tiempo_ejecutado + procesos[i].tiempo_comienzo;
    alert("El proceso ".concat(procesos[i].nombre, " ha sido bloqueado."));
};
/**
 * Función encargada de reanudar un proceso bloqueado.
 */
var reanudarProceso = function () {
    if (i === procesos.length) {
        return;
    }
    procesos[i].bloqueo.estado_block = false;
    alert("El proceso ".concat(procesos[i].nombre, " ha sido desbloqueado."));
    change();
    procesos.push(procesos.splice(i, 1)[0]);
};
/**
 * Función encargada del manejo de la sección crítica.
 */
var handler = function () {
    if (!hayProcesos || !ejecutar) {
        return;
    }
    if (procesos[i].bloqueo.estado_block) {
        procesos[i].bloqueo.tiempo_block++;
        return;
    }
    if (procesos[i].tiempo_ejecutado < procesos[i].rafaga) {
        busy();
        procesos[i].tiempo_ejecutado++;
    }
    else {
        registrarProceso(procesos[i]);
        dibujarProceso(procesos[i]);
        i++;
        change();
    }
};
/**
 * Función que dibuja la recta numérica inicial del diagrama.
 */
var iniciarDiagrama = function () {
    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font = '10pt Arial';
    ctx.moveTo(0, 7.5);
    ctx.lineTo(canvas.width, 7.5);
    for (var j = 0; j <= canvas.width / 10; j++) {
        ctx.moveTo(2 + j * 10, 2);
        ctx.lineTo(2 + j * 10, 13);
        ctx.stroke();
        if (j % 5 === 0) {
            if (j >= 10) {
                ctx.fillText(j.toString(), j * 10 - 5, 30);
            }
            else {
                ctx.fillText(j.toString(), j * 10, 30);
            }
        }
    }
};
var time = setInterval(handler, 1000);
btnEnviar.addEventListener('click', function () {
    enviarProceso();
});
btnEjecutar.addEventListener('click', function () {
    ejecutarProceso();
});
btnEnviarEjecutar.addEventListener('click', function () {
    enviarEjecutarProceso();
});
btnBloquear.addEventListener('click', function () {
    bloquearProceso();
});
btnReanudar.addEventListener('click', function () {
    reanudarProceso();
});
free();
iniciarDiagrama();
