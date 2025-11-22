import { jest } from '@jest/globals';
import { NotificacionService } from '../../services/notificacionService.js';
import { ErrorDeBusquedaid } from '../../errores/errorDeBusquedaid.js';

describe('NotificacionService', () => {
  let notificacionRepoMock;
  let notificacionService;

  beforeEach(() => {
    notificacionRepoMock = {
      create: jest.fn(),
      findNoLeidas: jest.fn(),
      findLeidas: jest.fn(),
      findById: jest.fn(),
      marcarComoLeida: jest.fn(),
    };

    notificacionService = new NotificacionService(notificacionRepoMock);
  });


  test('crear() debe delegar en el repositorio', async () => {
    const data = { mensaje: 'Nueva notificación' };
    const creada = { id: 1, ...data };

    notificacionRepoMock.create.mockResolvedValue(creada);

    const resultado = await notificacionService.crear(data);

    expect(notificacionRepoMock.create).toHaveBeenCalledWith(data);
    expect(resultado).toEqual(creada);
  });


  test('obtenerNoLeidas() debe devolver las notificaciones no leídas', async () => {
    const usuarioId = 5;
    const noLeidas = [{ id: 1, leida: false }];
    notificacionRepoMock.findNoLeidas.mockResolvedValue(noLeidas);

    const resultado = await notificacionService.obtenerNoLeidas(usuarioId);

    expect(notificacionRepoMock.findNoLeidas).toHaveBeenCalledWith(usuarioId);
    expect(resultado).toEqual(noLeidas);
  });


  test('obtenerLeidas() debe devolver las notificaciones leídas', async () => {
    const usuarioId = 10;
    const leidas = [{ id: 2, leida: true }];
    notificacionRepoMock.findLeidas.mockResolvedValue(leidas);

    const resultado = await notificacionService.obtenerLeidas(usuarioId);

    expect(notificacionRepoMock.findLeidas).toHaveBeenCalledWith(usuarioId);
    expect(resultado).toEqual(leidas);
  });


  test('marcarComoLeida() lanza ErrorDeBusquedaid si no existe la notificación', async () => {
    notificacionRepoMock.findById.mockResolvedValue(null);

    await expect(notificacionService.marcarComoLeida(99))
      .rejects
      .toThrow(ErrorDeBusquedaid);

    expect(notificacionRepoMock.findById).toHaveBeenCalledWith(99);
  });


  test('marcarComoLeida() actualiza y guarda la notificación si existe', async () => {
    const notificacionMock = {
      id: 1,
      leida: false,
      marcarComoLeida: jest.fn().mockImplementation(function() {
        this.leida = true;
      }),
    };

    notificacionRepoMock.findById.mockResolvedValue(notificacionMock);
    notificacionRepoMock.marcarComoLeida.mockResolvedValue();

    const resultado = await notificacionService.marcarComoLeida(1);

    expect(notificacionRepoMock.findById).toHaveBeenCalledWith(1);
    expect(notificacionMock.marcarComoLeida).toHaveBeenCalled();
    expect(notificacionMock.leida).toBe(true);
    expect(notificacionRepoMock.marcarComoLeida).toHaveBeenCalledWith(1, notificacionMock);
    expect(resultado).toEqual(notificacionMock);
  });
});
