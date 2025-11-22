import {ErrorDeBusquedaid} from  "../errores/errorDeBusquedaid.js";

export class NotificacionService {

  //async para hacer operaciones que tardan, y devuelven promesas
 constructor(notificacionRepository) {
    this.notificacionRepository = notificacionRepository;
  }

  async crear(data) {
    return await this.notificacionRepository.create(data);
  }

  async obtenerNoLeidas(usuarioId) {
    return await this.notificacionRepository.findNoLeidas(usuarioId);
  }

  async obtenerLeidas(usuarioId) {
    return await this.notificacionRepository.findLeidas(usuarioId);
    

  }

  async marcarComoLeida(id) {
    const notificacion = await this.notificacionRepository.findById(id);

    if(!notificacion) {
      throw new ErrorDeBusquedaid (`Notificacion con id ${id} no encontrada`);
    }

    return await this.notificacionRepository.marcarComoLeida(id);

  }

  async marcarTodasComoLeidas(usuarioId) {
    return await this.notificacionRepository.marcarTodasLeidas(usuarioId);
  }


}
