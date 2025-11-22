export class ErrorDeFechas extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorDeFechas";  //la clase Error ya tiene un atributo name, asiq lo sobreescribo para que sea mas especifico
    } 
    getMensaje() {return this.mensaje}
}