import mongoose from "mongoose";

const CambioEstadoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  estado: { type: String, enum: ["Pendiente", "Confirmado", "En_preparacion","Enviado", "Entregado", "Cancelado"], required: true },
  quien: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Pedido", required: true },
  motivo: { type: String }
}, { _id: false });

export { CambioEstadoSchema };
