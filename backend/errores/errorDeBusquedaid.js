export class ErrorDeBusquedaid extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "Error de busqueda de id"; 
    } 
    getMensaje() {return this.mensaje}
}