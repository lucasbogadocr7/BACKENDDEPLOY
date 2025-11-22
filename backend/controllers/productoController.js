import { z } from "zod";
import { TipoDeUsuario } from "../modulos/dominio/tipoDeUsuario.js";

export class ProductoController {
  constructor(productoService) {
    this.productoService = productoService;
  }
  async crear(req, res, next) {
    
    if (!req.usuarioDb) {
      return res.status(401).json({ error: "No autenticado." });
    }
    console.log("Usuario autenticado:", req.usuarioDb);
     
    if (req.usuarioDb.tipo !== TipoDeUsuario.VENDEDOR) {
       return res.status(403).json({ error: "No tienes permisos de 'Vendedor'." });
    }

   /*  const datosProducto = {
      ...req.body, 
      vendedor: req.usuarioDb._id.toString() 
    };

    const resultBody = productoSchema.safeParse(datosProducto);
    
    if(resultBody.error) {
        res.status(400).json(resultBody.error.issues);
        return;
    } */
    
    try {
      // 1) Normalizar categorias: puede llegar como 'categorias[]' (FormData) o 'categorias'
      let categorias = [];
      if (req.body["categorias[]"]) {
        // multer/express puede exponer como string o array
        categorias = Array.isArray(req.body["categorias[]"]) ? req.body["categorias[]"] : [req.body["categorias[]"]];
      } else if (req.body.categorias) {
        categorias = Array.isArray(req.body.categorias) ? req.body.categorias : [req.body.categorias];
      }

      // 2) Procesar archivos subidos por multer
      const files = req.files || [];
      
      const fotos = files.map((f) => `/uploads/${f.filename}`);

      // Construir el objeto inicial desde req.body
      const raw = {
        ...req.body,
        categorias,
        fotos,
        vendedor: req.usuarioDb._id.toString()
      };

      // Convertir campos numéricos que vienen como string a number
      const parsed = {
        ...raw,
        precio: raw.precio !== undefined ? Number(raw.precio) : undefined,
        stock: raw.stock !== undefined ? Number(raw.stock) : undefined
      };

      // Validar conversión numérica
      if (parsed.precio !== undefined && !Number.isFinite(parsed.precio)) {
        return res.status(400).json({ error: "El campo 'precio' debe ser un número válido." });
      }
      if (parsed.stock !== undefined && !Number.isFinite(parsed.stock)) {
        return res.status(400).json({ error: "El campo 'stock' debe ser un número válido." });
      }

      // Validación con Zod
      const resultBody = productoSchema.safeParse(parsed);

      if (resultBody.error) {
        console.warn("Validación de producto falló:", resultBody.error.issues);
        return res.status(400).json(resultBody.error.issues);
      }

      const nuevoProducto = await this.productoService.crear(resultBody.data);
      return res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error("Error en ProductoController.crear:", error);
      return next(error);
    }
  }
  

  async listar(req, res, next) {
    try {
      const result = filtroSchema.safeParse(req.query);
      
      if (result.error) {
        return res.status(400).json(result.error.issues);
      }
      
      const productos = await this.productoService.listar(result.data);
      res.status(200).json(productos);

    } catch (error) {
        next(error);
    }
  }

  async masVendidos(req, res, next) {
    try {
      const productos = await this.productoService.masVendidos();
      res.status(200).json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await this.productoService.obtenerPorId(id);
      if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
      return res.status(200).json(producto);
    } catch (error) {
      next(error);
    }
  }
}

const monedaEnum = z.enum(["Peso_arg", "Dolar_usa", "Real"], {
  errorMap: () => ({ message: "Moneda inválida." })
});

export const productoSchema = z.object({
  vendedor: z.string().min(1), 
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  categorias: z.array(z.string()).optional().default([]),
  precio: z.number().positive(),
  moneda: monedaEnum,
  stock: z.number().int().nonnegative(),
  fotos: z.array(z.string()).optional().default([]),
  archivo: z.string().optional()
});


const filtroSchema = z.object({
  vendedorId: z.string().optional(), 
  nombre: z.string().optional(),  
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  precioMin: z.string().optional(),
  precioMax: z.string().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  ordenamiento: z.enum(["precio_asc", "precio_desc", "mas_vendido"]).optional()  
});
