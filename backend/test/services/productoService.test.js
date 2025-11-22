import { jest } from '@jest/globals';
import { ProductoService } from '../../services/productoService.js';
import { Producto } from '../../modulos/dominio/producto.js';

describe('ProductoService', () => {
  let productoRepoMock;
  let productoService;

  beforeEach(() => {
    productoRepoMock = {
      save: jest.fn(),
      buscarPorPagina: jest.fn(),
    };
    productoService = new ProductoService(productoRepoMock);
  });


  test('crear() debe guardar un nuevo producto correctamente', async () => {
    const datosProducto = {
      vendedor: '123',
      titulo: 'PlayStation 5',
      descripcion: 'Consola de juegos',
      categorias: ['Consolas'],
      precio: 1200,
      moneda: 'USD',
      stock: 10,
      fotos: [],
      archivo: null
    };

    const productoGuardadoMock = { id: '1', ...datosProducto };
    productoRepoMock.save.mockResolvedValue(productoGuardadoMock);

    const resultado = await productoService.crear(datosProducto);

    // veo q el repositorio se llame con un objeto Producto
    expect(productoRepoMock.save).toHaveBeenCalled();
    expect(productoRepoMock.save.mock.calls[0][0]).toBeInstanceOf(Producto);
    // El resultado tiene q ser el que devuelve el repo
    expect(resultado).toEqual(productoGuardadoMock);
  });


  test('listar() debe pedir al repositorio los productos paginados', async () => {
    const filtros = { page: 2, limit: 5, categoria: 'Consolas'};
    const productosMock = [{ id: 1 }, { id: 2 }];
    productoRepoMock.buscarPorPagina.mockResolvedValue(productosMock);

    const resultado = await productoService.listar(filtros);

    expect(productoRepoMock.buscarPorPagina).toHaveBeenCalledWith(2,5,filtros);
    expect(resultado).toEqual(productosMock);
  });


  test('listar() debe usar valores por defecto (page=1, limit=10)', async () => {
    const filtros = { categoria: 'Consolas' };
    const productosMock = [{ id: 1 }];
    productoRepoMock.buscarPorPagina.mockResolvedValue(productosMock);

    await productoService.listar(filtros);

    expect(productoRepoMock.buscarPorPagina).toHaveBeenCalledWith(1,10,filtros);
  });
});
