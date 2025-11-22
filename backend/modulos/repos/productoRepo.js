import { ProductoModel } from "../../schemas/productoSchema.js";
export class ProductoRepository {
  constructor() {

    this.cotizacionUSD = 1400;
    this.cotizacionREAL = 260;
    this.model = ProductoModel; // ahora siempre vamos a usar Mongo

    this.estrategiasOrdenamiento = {
      precio_asc: (a, b) => a.precio - b.precio,
      precio_desc: (a, b) => b.precio - a.precio,
      mas_vendido: (a, b) => (b.cantidadVendida ?? 0) - (a.cantidadVendida ?? 0),
    };
  }

  async save(producto) {
    const nuevoProducto = new this.model(producto);
    return await nuevoProducto.save();
  }

  async precioEnPesos(producto) {
    if (producto.moneda === 'USD') {
      return await producto.precio * this.cotizacionUSD;
    }
    return await producto.precio;
  }

  async buscarPorId(id) {
    return await this.model.findById(id).exec();   //usar lean()???
  }

  async modificarStock(id, producto) {
    return await this.model.findByIdAndUpdate(id, { stock: producto.stock }, { new: true });
  }

  async modificarCantVendida(id, producto) {
    return await this.model.findByIdAndUpdate(id, { cantidadVendida: producto.cantidadVendida }, { new: true });
  }

  async buscarSegunCriterios(filtros) {
    const { vendedorId, nombre, descripcion, categoria, precioMin, precioMax, ordenamiento } = filtros;

    const query = {};

    if (vendedorId) query.vendedor = vendedorId;
    if (nombre) query.titulo = new RegExp(nombre, "i");
    if (descripcion) query.descripcion = new RegExp(descripcion, "i");
    if (categoria) query.categorias = categoria;

    // Traemos los productos que cumplen los filtros de MongoDB
    let productos = await this.model.find(query).exec();

    // Filtramos por precio en pesos
    productos = productos.filter(producto => {
      const precioEnPesos = this.convertirMoneda(producto.precio, producto.moneda, "Peso_arg");

      // Guardamos temporalmente para ordenamiento
      producto._precioEnPesos = precioEnPesos;

      if (precioMin !== undefined && precioEnPesos < precioMin) return false;
      if (precioMax !== undefined && precioEnPesos > precioMax) return false;

      return true;
    });

    // Ordenamos
    if (ordenamiento === "precio_asc") {
      productos.sort((a, b) => a._precioEnPesos - b._precioEnPesos);
    } else if (ordenamiento === "precio_desc") {
      productos.sort((a, b) => b._precioEnPesos - a._precioEnPesos);
    } else if (ordenamiento === "mas_vendido") {
      productos.sort((a, b) => b.cantidadVendida - a.cantidadVendida);
    }

    //eliminar el campo temporal si no querés exponerlo
    productos.forEach(p => delete p._precioEnPesos);

    return productos;
  }

  convertirMoneda(precio, monedaOrigen, monedaDestino) { // es medio feo pero no se me ocurrio otra cosa
    if (monedaOrigen === monedaDestino) return precio;

    let precioConvertido;

    switch (monedaOrigen) {
      case "Dolar_usa":
        precioConvertido = precio * this.cotizacionUSD;
        break;
      case "Real":
        precioConvertido = precio * this.cotizacionREAL;
        break;
      default:
        throw new Error(`Moneda origen no soportada: ${monedaOrigen}`);
    }
    return precioConvertido;
  }

  async buscarPorPagina(numeroPagina, elementosXPagina, filtros) {
    const offset = (numeroPagina - 1) * elementosXPagina;

    const productos = await this.buscarSegunCriterios(filtros);

    return productos.slice(offset, offset + elementosXPagina);
  }

  async buscarTopVendidos() {
    return await this.model.find().sort({ cantidadVendida: -1 }).limit(10).exec();
  }
}