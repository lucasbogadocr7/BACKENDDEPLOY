import { jest } from '@jest/globals';
import { UsuarioService } from '../../services/usuarioService.js';
import { ErrorObjetoExistente } from '../../errores/errorObjetoExistente.js';

describe('UsuarioService', () => {
  let usuarioRepoMock;
  let service;

  beforeEach(() => {
    usuarioRepoMock = {
      findByMail: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };
    service = new UsuarioService(usuarioRepoMock);
  });

  test('crear() guarda un nuevo usuario si el mail no existe', async () => {
    usuarioRepoMock.findByMail.mockResolvedValue(null);
    usuarioRepoMock.save.mockResolvedValue({ id: 1, nombre: 'Lucas' });

    const result = await service.crear({
      nombre: 'Lucas',
      email: 'lucas@test.com',
      telefono: '123',
      tipo: 'Comprador',
    });

    expect(usuarioRepoMock.findByMail).toHaveBeenCalledWith('lucas@test.com');
    expect(usuarioRepoMock.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, nombre: 'Lucas' });
  });

  test('crear() lanza error si el mail ya existe', async () => {
    usuarioRepoMock.findByMail.mockResolvedValue({ id: 1, email: 'lucas@test.com' });

    await expect(service.crear({ email: 'lucas@test.com' }))
      .rejects.toThrow(ErrorObjetoExistente);
  });

  test('buscarTodos() llama al repositorio', async () => {
    usuarioRepoMock.findAll.mockResolvedValue([{ nombre: 'Lucas' }]);
    const result = await service.buscarTodos();
    expect(usuarioRepoMock.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ nombre: 'Lucas' }]);
  });
});
