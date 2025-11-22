import {Usuario} from '../modulos/dominio/usuario.js';
import { ErrorObjetoExistente } from '../errores/errorObjetoExistente.js';

export class UsuarioService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async crear(data) {
        const { nombre, email, telefono, tipo } = data;

        const existente = await this.usuarioRepository.findByMail(email);
        if (existente) {
            throw new ErrorObjetoExistente(`Ya existe un usuario con el mail ${email}`);
        } 

        const nuevo = new Usuario(nombre, email, telefono, tipo, new Date());
        const usuarioGuardado = await this.usuarioRepository.save(nuevo);
        return usuarioGuardado;
    }

    async buscarTodos() {
        const usuarios = await this.usuarioRepository.findAll();
        return usuarios;
    }

}