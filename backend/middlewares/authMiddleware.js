// En: backend/middlewares/authMiddleware.js

import { UsuarioRepository } from '../modulos/repos/usuarioRepo.js';
import { Usuario } from '../modulos/dominio/usuario.js';
import { TipoDeUsuario } from '../modulos/dominio/tipoDeUsuario.js';

const usuarioRepo = new UsuarioRepository();

const provisionUsuario = async (req, res, next) => {
  try {
    if (!req.kauth || !req.kauth.grant) {
      return next();
    }

    const token = req.kauth.grant.access_token.content;
    const keycloakId = token.sub;
    const email = token.email; // Sacamos el email


    let usuarioDb = await usuarioRepo.buscarPorKeycloakId(keycloakId);

    if (!usuarioDb) {

      usuarioDb = await usuarioRepo.findByMail(email);

      if (usuarioDb) {

        console.log(`[Auth] Usuario existente por email (${email}). Linkeando a Keycloak...`);
        await usuarioRepo.linkKeycloak(email, keycloakId);

        usuarioDb = await usuarioRepo.buscarPorKeycloakId(keycloakId);
      } else {

        console.log(`[Auth] Provisioning de nuevo usuario: ${token.preferred_username}`);

        let tipoUsuario;
        if (token.realm_access?.roles.includes('administrador')) {
          tipoUsuario = TipoDeUsuario.ADMIN;
        } else if (token.realm_access?.roles.includes('vendedor')) {
          tipoUsuario = TipoDeUsuario.VENDEDOR;
        } else {
          tipoUsuario = TipoDeUsuario.COMPRADOR;
        }

        const nuevoUsuario = new Usuario(
          token.name || token.preferred_username,
          token.email,
          token.telefono || null,
          tipoUsuario,
          new Date()
        );
        nuevoUsuario.keycloakId = keycloakId;

        try {

          usuarioDb = await usuarioRepo.save(nuevoUsuario);
        } catch (error) {

          if (error.code === 11000) {

            console.warn(`[Auth] Race condition detectada para ${email}. Re-intentando búsqueda...`);

            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms de espera
            usuarioDb = await usuarioRepo.findByMail(email);
          } else {

            throw error;
          }
        }
      }
    }

    const roles = token.realm_access?.roles || [];

    let tipoActualizado;
    if (roles.includes('administrador')) {
      tipoActualizado = TipoDeUsuario.ADMIN;
    } else if (roles.includes('vendedor')) {
      tipoActualizado = TipoDeUsuario.VENDEDOR;
    } else {
      tipoActualizado = TipoDeUsuario.COMPRADOR;
    }

    if (usuarioDb && usuarioDb.tipo !== tipoActualizado) {
      console.log(`[Auth] Actualizando tipo de usuario ${email}: ${usuarioDb.tipo} → ${tipoActualizado}`);
      usuarioDb.tipo = tipoActualizado;
      await usuarioRepo.update(usuarioDb._id, { tipo: tipoActualizado });
    }


    if (usuarioDb) {
      req.usuarioDb = usuarioDb;
    } else {
      console.error(`[Auth] ¡CRÍTICO! No se pudo provisionar ni encontrar al usuario ${email} después de los intentos.`);
    }

    next();

  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error("[Auth] Error de validación al provisionar usuario:", error.message);
      return res.status(400).json({ error: `Error de validación: ${error.message}` });
    }
    console.error("[Auth] Error fatal en el middleware de provisioning:", error);
    res.status(500).json({ error: "Error al procesar la autenticación de usuario" });
  }
};

export { provisionUsuario };