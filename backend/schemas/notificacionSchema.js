import mongoose from "mongoose";
import { Notificacion } from "../modulos/dominio/notificacion.js";

const NotificacionSchema = new mongoose.Schema({
usuarioDestino: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usuario", 
    // Solo es requerido si usuarioKeycloakId NO está presente.
    required: function() { return !this.usuarioKeycloakId; } 
  },
  usuarioKeycloakId: { type: String, index: true }, // si no no me anda el front
  mensaje: { type: String, required: true },
  fechaAlta: { type: Date, default: Date.now },
  leida: { type: Boolean, default: false, required: true },
  fechaLeida: { type: Date },
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Pedido" },

},{
    timestamps: true,
    collection: 'notificaciones'
});

NotificacionSchema.pre(/^find/, function(next) {
    this.populate('usuarioDestino', '');
    next();
});

NotificacionSchema.loadClass(Notificacion);
export const  NotificacionModel = mongoose.model('Notificacion', NotificacionSchema, "notificaciones");

