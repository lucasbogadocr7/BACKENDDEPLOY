export class ErrorDeTipo extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorDeTipo"; 
    } 
    getMensaje() {return this.mensaje}
}