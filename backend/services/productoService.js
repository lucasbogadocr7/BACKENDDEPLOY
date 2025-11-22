import { Producto } from '../modulos/dominio/producto.js';

export class ProductoService {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async crear(datosProducto) {
    const { vendedor, titulo, descripcion, categorias, precio, moneda, stock, fotos, archivo } = datosProducto;
    const nuevoProducto = new Producto(vendedor, titulo, descripcion, categorias, precio, moneda, stock, fotos, archivo, 0);
    const productoGuardado = await this.productoRepository.save(nuevoProducto);
    return productoGuardado;
  }

  async listar(filtros) {
    const { page = 1, limit = 10 } = filtros;
    return await this.productoRepository.buscarPorPagina(page, limit, filtros);
  }

  async obtenerPorId(id) {
    return this.productoRepository.buscarPorId(id); 
  }

  async masVendidos() {
    return await this.productoRepository.buscarTopVendidos();
  }


}