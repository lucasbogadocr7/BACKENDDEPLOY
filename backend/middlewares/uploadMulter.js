import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Carpeta base de uploads en la raíz del proyecto
const UPLOADS_BASE = path.join(process.cwd(), "uploads");
//const PRODUCTS_DIR = path.join(UPLOADS_BASE, "products");

// Asegurarse de que exista la carpeta (se crea al arrancar)
fs.mkdirSync(UPLOADS_BASE, { recursive: true });

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_BASE);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = uuidv4();
    cb(null, `${name}${ext}`);
  }
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Sólo se permiten archivos de imagen"), false);
  }
  cb(null, true);
};

// Límites (ajustalos según necesidades)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5 MB por archivo
};

// Exportar multer y la ruta del directorio (útil para servir estáticos)
export const upload = multer({ storage, fileFilter, limits });
export const UPLOADS_DIR = UPLOADS_BASE;
export const PRODUCTS_UPLOAD_DIR = UPLOADS_BASE;