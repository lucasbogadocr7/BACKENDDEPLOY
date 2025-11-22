import { ProductoController } from "../controllers/productoController.js";
import express from "express";
import { upload } from "../middlewares/uploadMulter.js";

const pathProducto = "/productos";

export default function productoRoutes(getController) {
  const router = express.Router();

  router.post(pathProducto, upload.array("fotos", 10), (req, res, next) => {
    getController(ProductoController).crear(req, res, next);
  });


  router.get(pathProducto, (req, res, next) => {
    getController(ProductoController).listar(req, res,next);
  });

  router.get(pathProducto + "/top", (req, res, next) => {
    getController(ProductoController).masVendidos(req, res,next);
  });

  router.get(pathProducto + "/:id", (req, res, next) => {
    getController(ProductoController).obtenerPorId(req, res, next);
  });
  

  return router;
}
