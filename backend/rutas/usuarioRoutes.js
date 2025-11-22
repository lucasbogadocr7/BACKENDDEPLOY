import { UsuarioController } from "../controllers/usuarioController.js";
import express from 'express'

const pathUsuario = "/usuarios";

export default function usuarioRoutes(getController) {
    const router = express.Router();

    router.post(pathUsuario, (req, res, next) => {
        getController(UsuarioController).crear(req,res,next)
    });

    router.get(pathUsuario, (req, res, next) => {
        getController(UsuarioController).obtenerTodos(req, res, next)
    });

    return router;
}