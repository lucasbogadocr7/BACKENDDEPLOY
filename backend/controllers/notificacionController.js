import {z} from "zod"

export class NotificacionController {

  constructor(notificacionService){
    this.notificacionService = notificacionService
  }

  async listar(req, res, next) {
    try {
      const usuarioId = req.params.id; 
      const leidas = req.query.leida === "true"; 

      const notifs = leidas
        ? await this.notificacionService.obtenerLeidas(usuarioId)
        : await this.notificacionService.obtenerNoLeidas(usuarioId);
      
      res.status(200).json(notifs);
    } catch (error) {
        next(error);
    }
  }
  

  async marcarLeida(req, res, next) {
    const id = req.params.id;
    
    try {
        const notif = await this.notificacionService.marcarComoLeida(id);
        res.status(200).json(notif);
    } catch (error) {
      next(error);
    }
    
  }

  async marcarTodasLeidas(req, res, next) {
    const usuarioId = req.params.id;

    try {
      const result = await this.notificacionService.marcarTodasComoLeidas(usuarioId);
      res.status(200).json(result);
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({ message: "Id de usuario inválido" });
      }
      next(error);
    }
  }

}