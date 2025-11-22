import {ErrorDeStock} from "../../errores/errorDeStock.js";

export class Producto {
    constructor(vendedor, titulo, descripcion, categorias, precio, moneda, stock, fotos, archivo, cantidadVendida) {
        this.vendedor = vendedor;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.categorias = categorias || [];
        this.precio = precio;
        this.moneda = moneda; 
        this.stock = stock;
        this.fotos = fotos || [];
        this.archivo = archivo;
        this.cantidadVendida = cantidadVendida;
    }

    estaDisponible(cantidad) {
        return cantidad <= this.stock; 
    }

    reducirStock(cantidad) {
        if (this.stock < cantidad) {
            throw new ErrorDeStock (`No hay stock suficiente para reducir`);
        }
        
        this.stock -= cantidad;
        //this.stock = Math.max(0, this.stock);
        return this.stock;
    }

    aumentarStock(cantidad) {
        return this.stock += cantidad;
    }

    agregarFoto(url) {
        this.fotos.push(url);
    }

    agregarCategoria(cat) {
        this.categorias.push(cat);
    }

    modificarCantVendida(cantidad) {
        return this.cantidadVendida += cantidad;
    }
}
