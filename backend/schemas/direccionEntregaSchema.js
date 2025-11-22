import mongoose from "mongoose";

const DireccionEntregaSchema = new mongoose.Schema({
  calle: { type: String, required: true },
  altura: { type: Number, required: true },
  piso: { type: Number },
  departamento: { type: String },
  codigoPostal: { type: String, required: true },
  ciudad: { type: String, required: true },
  provincia: { type: String, required: true },
  pais: { type: String, required: true },
  lat: { type: String },
  lon: { type: String }
}, { _id: false });
export { DireccionEntregaSchema };
