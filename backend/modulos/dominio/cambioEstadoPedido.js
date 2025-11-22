import {EstadoPedido} from "./estadoPedido.js";

export class CambioEstadoPedido {
    constructor(fecha, estado, pedido, usuario, motivo) {
        this.fecha = fecha;

        if (!Object.values(EstadoPedido).includes(estado)) {
            throw new Error(`Estado de pedido inválido: ${estado}`);
        }
        this.estado = estado;
        this.pedido = pedido;
        this.usuario = usuario;
        this.motivo = motivo;
    }
}
