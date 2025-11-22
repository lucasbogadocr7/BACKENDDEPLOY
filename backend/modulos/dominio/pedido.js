import {ErrorDeFechas} from "../../errores/errorDeFechas.js";
import {ErrorDeEstado} from "../../errores/errorDeEstado.js";
import {EstadoPedido} from "./estadoPedido.js";
import {ErrorDeStock} from "../../errores/errorDeStock.js";
import {CambioEstadoPedido} from "./cambioEstadoPedido.js";

export class Pedido {
    constructor(comprador, items, total, moneda, direccionEntrega, estado, fechaCreacion, historialEstados) {
        
        if (!(fechaCreacion instanceof Date)) {
            throw new ErrorDeFechas("La fecha de creacion debe ser un objeto Date");
        }    //cuando se intenta crear una instancia de esta clase, usamos try-catch para manejar el error

        estado = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();  //esto hace que no importe si el estado viene en 
        // mayusculas o minusculas, lo normaliza
        if (!Object.values(EstadoPedido).includes(estado)) {
            throw new ErrorDeEstado("estado invalido");
        }

        this.comprador = comprador;
        this.items = items || [];
        this.total = total;
        this.moneda = moneda;
        this.direccionEntrega = direccionEntrega; 
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.historialEstados = historialEstados || [];
    }

    calcularTotal() {
        this.total = this.items.reduce((acumulador, item) => {
            return acumulador + item.subtotal();
        }, 0);
    }

    actualizarEstado(nuevoEstado, quien, motivo) {
        
        if (!Object.values(EstadoPedido).includes(nuevoEstado)) {
            throw new ErrorDeEstado(`Estado de pedido inválido: ${nuevoEstado}`);
        }
        
        this.estado = nuevoEstado;
        let estadoPedido = new CambioEstadoPedido(new Date(), nuevoEstado, this, quien, motivo);
        this.historialEstados.push(estadoPedido);

    }

    validarStock() {        //se valida una vez ya puesto en el "carrito" y antes de confirmar el pedido
        for (const item of this.items) {
            if (!item.hayStock()) {
                throw new ErrorDeStock (`No hay stock suficiente para: ${item.producto.titulo}`);
            }
        }
    }

    agregarItem(producto) {
        this.items.push(producto);
    }
}