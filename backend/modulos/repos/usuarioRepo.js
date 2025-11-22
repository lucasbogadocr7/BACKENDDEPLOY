import { UsuarioModel } from "../../schemas/usuarioSchema.js";

export class UsuarioRepository {
    constructor() {
        this.model = UsuarioModel;
    }

    async save(usuario) {
        const nuevoUsuario = new this.model(usuario);
        return await nuevoUsuario.save();
    }

    async findAll() {
        return await this.model.find();
    }

    async findByMail(email) {
        return await this.model.findOne({ email: email });
    }

    async buscarPorKeycloakId(id) {

        return UsuarioModel.findOne({ keycloakId: id });
    }

    async linkKeycloak(email, keycloakId) {
        // Busca al usuario por email y le setea el keycloakId
        return await this.model.updateOne(
            { email: email },
            { $set: { keycloakId: keycloakId } }
        );
    }

    async update(id, nuevosCampos) {
        return await this.model.updateOne(
            { _id: id },
            { $set: nuevosCampos }
        );
    }

}
