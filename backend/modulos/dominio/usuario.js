import {ErrorDeTipo} from "../../errores/errorDeTipo.js";
import {ErrorDeFechas} from "../../errores/errorDeFechas.js";
import {TipoDeUsuario} from "./tipoDeUsuario.js";

export class Usuario {
    constructor(nombre, email, telefono, tipo, fechaAlta) {
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;

        if(!(fechaAlta instanceof Date)) {
            throw new ErrorDeFechas("La fecha de alta debe ser un objeto Date");
        }

        if (!Object.values(TipoDeUsuario).includes(tipo)) {
            throw new ErrorDeTipo(`Tipo de usuario inválido: ${tipo}`);
        }

        this.tipo = tipo;
        this.fechaAlta = fechaAlta;
    }

    getDescripcion() {
        return `${this.nombre} (${this.tipo})`;
    }
   
}

//esto podriamos ponerlo en otro archivo:
export function crearUsuario(id, nombre, email, telefono, tipo, fechaAlta){
    try {
    return new Usuario(id, nombre, email, telefono, tipo, fechaAlta);
    } catch(error){
        if(error instanceof ErrorDeTipo){
        console.log("Error de tipo: ", error.getMensaje());
        return null;
        //si no queremos q retorne null y evitar validaciones extra en las pruebas pordemos hacer:
        //return { getDescripcion: () => "Usuario inválido" }; // por lo q vi esto se llama "objeto dummy"
        }
    }
}
