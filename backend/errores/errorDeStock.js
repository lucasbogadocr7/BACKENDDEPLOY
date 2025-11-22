export class ErrorDeStock extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorDeStock"; 
    } 
    getMensaje() {return this.mensaje}
}