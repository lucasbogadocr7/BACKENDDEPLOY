import { PedidoController } from "../controllers/pedidoController.js";
import express from 'express'
import { keycloak } from "../config/keycloak.js";
const pathPedido = "/pedidos";

export default function pedidoRoutes(getController) {
    const router = express.Router();

    router.post(pathPedido, keycloak.protect(['default-roles-tp-tienda-sol', 'admin']), (req, res, next) => {
        getController(PedidoController).crear(req,res,next)
    });

    router.patch(pathPedido + "/:id/cancelar", (req, res, next) => {
        getController(PedidoController).cancelar(req, res, next)
    });

    router.get(pathPedido + "/usuarios/:id", (req, res, next) => {
        getController(PedidoController).historialPorUsuario(req, res, next)
    });

    router.patch(pathPedido + "/:id/enviar", (req, res, next) => {
        getController(PedidoController).enviar(req, res, next)
    });

    router.patch(pathPedido + "/:id/confirmar", (req, res, next) => {
        getController(PedidoController).confirmar(req, res, next)
    });

    return router;
}