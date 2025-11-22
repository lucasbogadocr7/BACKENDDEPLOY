import express from "express";
import { NotificacionController } from "../controllers/notificacionController.js";


const pathNotif = "/notificaciones"

export default function notificacionRoutes(getController){

    const router = express.Router();

    router.get(pathNotif + "/usuarios/:id", (req, res, next) => {
        getController(NotificacionController).listar(req, res, next)}
    );
    
    router.patch(pathNotif + "/:id/leida", (req, res, next) => {
        getController(NotificacionController).marcarLeida(req, res, next)}
    );
    // PATCH /notificaciones/usuarios/:id/leidas
    router.patch(pathNotif + "/usuarios/:id/leidas", (req, res, next) =>
    getController(NotificacionController).marcarTodasLeidas(req, res, next)
    );

    return router;
}

