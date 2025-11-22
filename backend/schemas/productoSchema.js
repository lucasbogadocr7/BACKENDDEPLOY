import mongoose from "mongoose";
import { Producto } from "../modulos/dominio/producto.js";

const ProductoSchema = new mongoose.Schema({
	vendedor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
	titulo: { type: String, required: true },
	descripcion: { type: String },
	categorias: { type: [String], default: [] },
	precio: { type: Number, required: true },
    moneda: { type: String, enum: ["Peso_arg", "Dolar_usa", "Real"], required: true },
	stock: { type: Number, required: true },
	fotos: { type: [String], default: [] },
	archivo: { type: String },
	cantidadVendida: { type: Number, default: 0 }
}, {
	timestamps: true,
	collection: 'productos'
});

ProductoSchema.pre(/^find/, function(next) {
    this.populate('vendedor', '');
    next();
});


ProductoSchema.loadClass(Producto);

export const ProductoModel = mongoose.model('Producto', ProductoSchema, "productos");
