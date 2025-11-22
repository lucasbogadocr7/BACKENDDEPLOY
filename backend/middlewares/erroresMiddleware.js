import { ErrorDeBusquedaid } from "../errores/errorDeBusquedaid.js";
import { ErrorDeEstado } from "../errores/errorDeEstado.js";
import { ErrorDeStock } from "../errores/errorDeStock.js";
import { ErrorObjetoExistente } from "../errores/errorObjetoExistente.js";

export function errorHandler(err, _req, res, _next) {
    console.error(`Error capturado en el middleware: ${err.name} - ${err.message}`);

    // 400 Bad Request
    if (err.constructor.name === ErrorDeStock.name) {
        return res.status(400).json({ error: "Problema de stock", message: err.message });
    }
    
    // 404 Not Found
    if (err.constructor.name === ErrorDeBusquedaid.name) {
        return res.status(404).json({ error: "Recurso no encontrado", message: err.message });
    }

    // 409 Conflict
    if (err.constructor.name === ErrorDeEstado.name) {
        return res.status(409).json({ error: "Conflicto de estado", message: err.message });
    }

    // 400 Bad Request
    if (err.constructor.name === ErrorObjetoExistente.name) {
        return res.status(400).json({ error: "Objeto Existente", message: err.message });
    }
    
    // 500 Internal Server Error
    return res.status(500).json({ error: "Error interno del servidor", message: "Ups. Algo sucedió en el servidor." });
}