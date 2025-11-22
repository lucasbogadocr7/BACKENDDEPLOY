import {EstadoPedido} from "./estadoPedido.js";
import {Notificacion} from "./notificacion.js";

//se supone que estas funciones van a ser llamadas desde algun servicio o controlador, por ej
//cuando se crea un nuevo pedido, si pasado un tiempo o por algun motivo no se confirma o cancela
//se llama a crearSegunPedido(instanciaPedido) y se crea la notificacion correspondiente

export class FactoryNotificacion {
    crearSegunEstadoPedido(estado) { //devuelve el atributo mensaje de la clase notificacion
        switch(estado) {
            case EstadoPedido.CONFIRMADO:
                return "NOTIFICACION_NUEVO_PEDIDO";

            case EstadoPedido.ENVIADO: 
                return "NOTIFICACION_PEDIDO_ENVIADO";

            case EstadoPedido.CANCELADO:
                return "NOTIFICACION_PEDIDO_CANCELADO";

            case EstadoPedido.PENDIENTE:
                return "NOTIFICACION_PEDIDO_PENDIENTE";
            
            default:
                return null
        }
    }
    //USE UN SWICH Y NO POLIMORFISMO PORQUE NOS DIERON LOS ESTADOS COMO ENUM EN EL DIAGRAMA DE CLASES Y NO SE SI LO PUEDO CAMBIAR

    crearSegunPedido(pedido) { 
       const mensaje = this.crearSegunEstadoPedido(pedido.estado);
        const notificacionACrear = {
            usuarioKeycloakId: pedido.comprador, 
            mensaje: mensaje,
            fechaAlta: new Date(),
            leida: false,
            fechaLeida: null,
            pedido: pedido.id
        };
            return notificacionACrear;
 }
}