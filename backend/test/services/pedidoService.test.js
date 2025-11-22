import { jest } from '@jest/globals';
import { PedidoService } from '../../services/pedidoService.js';
import { ErrorDeBusquedaid } from '../../errores/errorDeBusquedaid.js';
import { ErrorDeEstado } from '../../errores/errorDeEstado.js';
import { ItemPedido } from '../../modulos/dominio/itemPedido.js';
import { Pedido } from '../../modulos/dominio/pedido.js';
import { EstadoPedido } from '../../modulos/dominio/estadoPedido.js';

// Mock de la FactoryNotificacion para no crear notificaciones reales
jest.unstable_mockModule('../../modulos/dominio/factoryNotification.js', () => ({
  FactoryNotificacion: jest.fn().mockImplementation(() => ({
    crearSegunPedido: jest.fn().mockReturnValue({ tipo: 'mockNoti' })
  }))
}));

describe('PedidoService', () => {
  let pedidoRepoMock;
  let productoRepoMock;
  let notificacionRepoMock;
  let service;

  beforeEach(() => {
    pedidoRepoMock = {
      crear: jest.fn(),
      buscarPorId: jest.fn(),
      actualizarElEstado: jest.fn(),
      buscarPorUsuarioId: jest.fn(),
    };

    productoRepoMock = {
      buscarPorId: jest.fn(),
      modificarStock: jest.fn(),
      modificarCantVendida: jest.fn(),
    };

    notificacionRepoMock = {
      create: jest.fn(),
    };

    service = new PedidoService(pedidoRepoMock, productoRepoMock, notificacionRepoMock);
  });


  test('crear() debe crear un pedido si los productos existen y hay stock', async () => {
    const productoMock = {
      id: 10,
      precio: 100,
      moneda: 'Peso_arg',
      reducirStock: jest.fn(),
      modificarCantVendida: jest.fn(),
      estaDisponible: jest.fn,
    };

    productoRepoMock.buscarPorId.mockResolvedValue(productoMock);
    pedidoRepoMock.crear.mockResolvedValue({ id: 1 });

    const data = {
      comprador: 1,
      moneda: 'Peso_arg',
      direccionEntrega: 'medrano 951',
      items: [{ producto: 10, cantidad: 2 }]
    };

    const result = await service.crear(data);

    expect(productoRepoMock.buscarPorId).toHaveBeenCalledWith(10);
    expect(pedidoRepoMock.crear).toHaveBeenCalled();
    expect(notificacionRepoMock.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 1 });
  });


  test('crear() lanza error si el producto no existe', async () => {
    productoRepoMock.buscarPorId.mockResolvedValue(null);

    const data = {
      comprador: 1,
      moneda: 'Peso_arg',
      direccionEntrega: 'Av Siempreviva 123',
      items: [{ producto: 999, cantidad: 1 }]
    };

    await expect(service.crear(data)).rejects.toThrow('Producto con ID 999 no encontrado.');
  });

  test('historialPorUsuario() devuelve los pedidos del usuario', async () => {
    const pedidosMock = [{ id: 1 }, { id: 2 }];
    pedidoRepoMock.buscarPorUsuarioId.mockResolvedValue(pedidosMock);

    const result = await service.historialPorUsuario(5);

    expect(pedidoRepoMock.buscarPorUsuarioId).toHaveBeenCalledWith(5);
    expect(result).toEqual(pedidosMock);
  });


  test('cancelar() lanza ErrorDeBusquedaid si el pedido no existe', async () => {
    pedidoRepoMock.buscarPorId.mockResolvedValue(null);

    await expect(service.cancelar(999, 1, 'motivo')).rejects.toThrow(ErrorDeBusquedaid);
  });


  test('cancelar() actualiza estado a CANCELADO', async () => {
    const pedidoMock = {
      id: 1,
      estado: EstadoPedido.PENDIENTE,
      items: [{ producto: { id: 10, aumentarStock: jest.fn(), modificarCantVendida: jest.fn() }, cantidad: 1 }],
      actualizarEstado: jest.fn(),
    };

    pedidoRepoMock.buscarPorId.mockResolvedValue(pedidoMock);
    productoRepoMock.buscarPorId.mockResolvedValue({
      id: 10,
      aumentarStock: jest.fn(),
      modificarCantVendida: jest.fn()
    });

    const result = await service.cancelar(1, 1, 'cliente canceló');

    expect(pedidoRepoMock.buscarPorId).toHaveBeenCalledWith(1);
    expect(pedidoRepoMock.actualizarElEstado).toHaveBeenCalled();
    expect(notificacionRepoMock.create).toHaveBeenCalled();
    expect(result).toBe(pedidoMock);
  });
});
