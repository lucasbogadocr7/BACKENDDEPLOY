export class Notificacion {
    constructor(usuarioDestino, mensaje, fechaAlta, leida, fechaLeida, pedido) {
        this.usuarioDestino = usuarioDestino;
        this.mensaje = mensaje;
        this.fechaAlta = fechaAlta;
        this.leida = leida;
        this.fechaLeida = fechaLeida;
        //atribitos que no estan en el diag de clases:
        this.pedido = pedido;
    }

    marcarComoLeida() {
        this.leida = true;
        this.fechaLeida = new Date();
    }

    
}