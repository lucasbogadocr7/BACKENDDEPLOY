import mongoose from "mongoose";
import { Usuario } from "../modulos/dominio/usuario.js";

const UsuarioSchema = new mongoose.Schema({
	nombre: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	telefono: { type: String },
	tipo: { type: String, enum: ["Comprador", "Vendedor", "Admin"], required: true },
	fechaAlta: { type: Date, default: Date.now, required: true },
	keycloakId: {
  		type: String,
  		unique: true,
  		sparse: true 
}
}, {
	collection: 'usuarios'
});

UsuarioSchema.loadClass(Usuario);

export const UsuarioModel = mongoose.model('Usuario', UsuarioSchema, "usuarios");
