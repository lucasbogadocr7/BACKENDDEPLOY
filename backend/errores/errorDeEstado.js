export class ErrorDeEstado extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorDeEstado"; 
    } 
    getMensaje() {return this.mensaje}
}