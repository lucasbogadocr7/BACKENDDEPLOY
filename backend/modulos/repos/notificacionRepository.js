import mongoose from "mongoose";
import { NotificacionModel } from "../../schemas/notificacionSchema.js";
import { UsuarioModel } from "../../schemas/usuarioSchema.js";
const { Types } = mongoose;


export class NotificacionRepository {
  constructor() {
    this.model = NotificacionModel;
  }

   _isObjectId(value) {
    return Types.ObjectId.isValid(value) && String(new Types.ObjectId(value)) === String(value);
  }

  async _buildUsuarioFilter(usuarioIdentifier) {
    if (!usuarioIdentifier) return null;
    if (this._isObjectId(usuarioIdentifier)) {
      return { usuarioDestino: new Types.ObjectId(usuarioIdentifier) };
    } else {
      // si la notificación ya tiene usuarioKeycloakId relleno, usamos ese campo
      // Si no lo tiene, intentamos resolver el usuario por keycloakId y usar su _id
      // Primero intentamos match directo por usuarioKeycloakId para ser efficientes:
      return { usuarioKeycloakId: usuarioIdentifier };
    }
  }

  async _resolveUsuarioObjectId(usuarioIdentifier) {
    if (!usuarioIdentifier) return null;
    if (Types.ObjectId.isValid(usuarioIdentifier)) {
      return new Types.ObjectId(usuarioIdentifier);
    }
    const usuario = await UsuarioModel.findOne({ keycloakId: usuarioIdentifier }).select("_id").lean().exec();
    if (!usuario) return null;
    return Types.ObjectId.isValid(usuario._id) ? new Types.ObjectId(usuario._id) : usuario._id;
  }

  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findOne({ _id: id }).populate("usuarioDestino").lean().exec();
  }

   async findNoLeidas(usuarioIdentifier) {
    const filtro = await this._buildUsuarioFilter(usuarioIdentifier);
    if (!filtro) return [];
    return this.model
      .find({ ...filtro, leida: false })
      .populate("usuarioDestino")
      .sort({ fechaAlta: -1 })
      .lean()
      .exec();
  }

  async findLeidas(usuarioIdentifier) {
    const filtro = await this._buildUsuarioFilter(usuarioIdentifier);
    if (!filtro) return [];
    return this.model
      .find({ ...filtro, leida: true })
      .populate("usuarioDestino")
      .sort({ fechaAlta: -1 })
      .lean()
      .exec();
  }

  async marcarComoLeida(id) {
    return this.model
      .findByIdAndUpdate(id, { leida: true, fechaLeida: new Date() }, { new: true, runValidators: true })
      .populate("usuarioDestino")
      .lean()
      .exec();
  }


async create(data) {
    // Clonar para no mutar el objeto original accidentalmente
    const payload = { ...data };

    // Si data trae usuarioKeycloakId y no usuarioDestino -> intentar resolver a usuarioDestino
    if (payload.usuarioKeycloakId && !payload.usuarioDestino) {
      const usuario = await UsuarioModel.findOne({ keycloakId: payload.usuarioKeycloakId }).select("_id").lean().exec();
      if (usuario && usuario._id) {
        payload.usuarioDestino = usuario._id;
      } else {
        const msg = `No se encontró usuario para keycloakId=${payload.usuarioKeycloakId}`;
        console.warn("[NotificacionRepository.create] " + msg, { payload });
        const err = new Error(msg);
        err.code = "USER_NOT_FOUND_FOR_KEYCLOAKID";
        throw err;
      }
    }

    // Si vino usuarioDestino como string y es ObjectId válido, convertir
    if (payload.usuarioDestino && typeof payload.usuarioDestino === "string" && this._isObjectId(payload.usuarioDestino)) {
      payload.usuarioDestino = new Types.ObjectId(payload.usuarioDestino);
    }

    // Si vino pedido como string que representa ObjectId, convertir a ObjectId
    if (payload.pedido && typeof payload.pedido === "string" && this._isObjectId(payload.pedido)) {
      payload.pedido = new Types.ObjectId(payload.pedido);
    }

    // Si fechaAlta viene como string, convertir a Date
    if (payload.fechaAlta && typeof payload.fechaAlta === "string") {
      const d = new Date(payload.fechaAlta);
      if (!Number.isNaN(d.getTime())) payload.fechaAlta = d;
      else delete payload.fechaAlta;
    }

    // Validación mínima local: mensaje requerido
    if (!payload.mensaje && !payload.title) {
      payload.mensaje = payload.title || `Notificación para pedido ${String(payload.pedido || "").slice(0,8)}`;
    }

    const notif = new this.model(payload);
    try {
      const saved = await notif.save();
      return saved.toObject ? saved.toObject() : saved;
    } catch (err) {
      // Log detallado para entender validaciones (MongoServerError con validator JSON Schema).
      console.error("[NotificacionRepository.create] Error al guardar notificación:", {
        message: err.message,
        name: err.name,
        code: err.code,
        errInfo: err.errInfo,
        // intentar extraer reglas insatisfechas si existen
        schemaRulesNotSatisfied: err?.errInfo?.details?.schemaRulesNotSatisfied,
        // Mongoose ValidationError may have .errors
        validationErrors: err.errors ? Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message })) : undefined,
        payload
      });
      throw err;
    }
  }


 async marcarTodasLeidas(usuarioIdentifier) {
  
    const filtro = this._isObjectId(usuarioIdentifier)
      ? { usuarioDestino: new Types.ObjectId(usuarioIdentifier) }
      : { usuarioKeycloakId: usuarioIdentifier };

    const filter = { ...filtro, leida: { $ne: true } };
    const update = { $set: { leida: true, fechaLeida: new Date() } };
    const result = await this.model.updateMany(filter, update).exec();
    return {
      acknowledged: result.acknowledged ?? true,
      matchedCount: result.matchedCount ?? result.n ?? 0,
      modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
    };
  }


}