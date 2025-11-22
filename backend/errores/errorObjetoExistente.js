export class ErrorObjetoExistente extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorObjetoExistente"; 
    } 
    getMensaje() {return this.mensaje}
}