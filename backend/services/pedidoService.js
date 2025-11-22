import { Pedido } from '../modulos/dominio/pedido.js';
import { EstadoPedido } from '../modulos/dominio/estadoPedido.js';
import { FactoryNotificacion } from '../modulos/dominio/factoryNotification.js';
import { ErrorDeBusquedaid } from '../errores/errorDeBusquedaid.js';
import { ErrorDeEstado } from '../errores/errorDeEstado.js';
import { ItemPedido } from "../modulos/dominio/itemPedido.js";


export class PedidoService {
    constructor(pedidoRepository, productoRepository, notificacionRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.notificacionRepository = notificacionRepository;
        
        this.cotizacionUSD = 1400;
        this.cotizacionREAL = 260;
    }

    convertirMoneda(precio, monedaOrigen, monedaDestino) { // es medio feo pero no se me ocurrio otra cosa
        if (monedaOrigen === monedaDestino) return precio;

        let precioConvertido;

        switch (monedaOrigen) {
            case "Dolar_usa":
                if (monedaDestino === "Peso_arg") precioConvertido = precio * this.cotizacionUSD;
                if (monedaDestino === "Real") precioConvertido = (precio * this.cotizacionUSD) / this.cotizacionREAL;
                break;
            case "Real":
                if (monedaDestino === "Peso_arg") precioConvertido = precio * this.cotizacionREAL;
                if (monedaDestino === "Dolar_usa") precioConvertido = (precio * this.cotizacionREAL) / this.cotizacionUSD;
                break;
            case "Peso_arg":
                if (monedaDestino === "Dolar_usa") precioConvertido = precio / this.cotizacionUSD;
                if (monedaDestino === "Real") precioConvertido = precio / this.cotizacionREAL;
                break;
            default:
                throw new Error(`Moneda origen no soportada: ${monedaOrigen}`);
        }

        return precioConvertido;
    }

    async crear(data) {
      const { comprador: keycloakId, items, moneda, direccionEntrega } = data;

      
        const itemsDeDominio = await Promise.all(items.map(async item => {

            const productoId = item.producto;

            if (!productoId) {
                throw new Error("El item de pedido no contiene un ID de producto válido.");
            }

            const productoCompleto = await this.productoRepository.buscarPorId(productoId);

            if (!productoCompleto) {
                throw new Error(`Producto con ID ${productoId} no encontrado.`);
            }

            // Convertir el precio del producto a la moneda del pedido
            const precioConvertido = this.convertirMoneda(
                productoCompleto.precio,
                productoCompleto.moneda,
                moneda
            );

            // Crear la instancia de ItemPedido con el objeto Producto cargado
            return new ItemPedido(
                productoCompleto,
                item.cantidad,
                precioConvertido // Le pongo el precio actual del producto en la moneda del pedido
            );
        }));

        const totalCalculado = itemsDeDominio.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);

        // 2. Crear el Pedido con los items completos

       const nuevoPedido = new Pedido(keycloakId, itemsDeDominio, totalCalculado, moneda, direccionEntrega, EstadoPedido.PENDIENTE, new Date(), []);
        nuevoPedido.validarStock();

        for (const item of nuevoPedido.items) {
            item.producto.reducirStock(item.cantidad);
            item.producto.modificarCantVendida(item.cantidad);
            await this.productoRepository.modificarStock(item.producto.id, item.producto);
            await this.productoRepository.modificarCantVendida(item.producto.id, item.producto);
        }

        const pedidoGuardado = await this.pedidoRepository.crear(nuevoPedido);
      try {
    const factoryNotificacion = new FactoryNotificacion();
    const notificacionCreada = factoryNotificacion.crearSegunPedido(pedidoGuardado);

    if (!notificacionCreada.usuarioKeycloakId && pedidoGuardado.comprador) {
      notificacionCreada.usuarioKeycloakId = pedidoGuardado.comprador;
    }

    // si el factory puso usuarioDestino como string, lo eliminamos (repo.create lo resolverá por usuarioKeycloakId)
    if (notificacionCreada.usuarioDestino && typeof notificacionCreada.usuarioDestino === 'string') {
      // antes de borrar, logueo para poder debuggear
      delete notificacionCreada.usuarioDestino;
    }

    if (!notificacionCreada.mensaje && !notificacionCreada.title) {
      notificacionCreada.mensaje = `Pedido ${String(pedidoGuardado._id).slice(0,8)} creado`;
    }

    // Intentamos guardar la notificación.  usuarioKeycloakId -> usuarioDestino
    const savedNotif = await this.notificacionRepository.create(notificacionCreada);
  } catch (err) {
    
    console.error("[PedidoService] crear - error al crear notificacion para pedido", {
      pedidoId: pedidoGuardado._id,
      comprador: pedidoGuardado.comprador,
      errorMessage: err.message,
      stack: err.stack
    });

    }
        return pedidoGuardado;
    }

    async cancelar(idPedido, idusuario, motivo) {
        const pedido = await this.pedidoRepository.buscarPorId(idPedido);

        if (!pedido) {
            throw new ErrorDeBusquedaid(`Pedido con id ${idPedido} no encontrado`);
        }

        if (pedido.estado === EstadoPedido.ENVIADO || pedido.estado === EstadoPedido.ENTREGADO || pedido.estado === EstadoPedido.CANCELADO) {
            throw new ErrorDeEstado(`No se puede cancelar un pedido en estado ${pedido.estado}`);
        }

        //actualizo estado pedido
        pedido.actualizarEstado(EstadoPedido.CANCELADO, idusuario, motivo);

        // devuelvo el stock de los productos
        for (const item of pedido.items) {
            const producto = await this.productoRepository.buscarPorId(item.producto.id);
            if (producto) {
                producto.aumentarStock(item.cantidad);
                producto.modificarCantVendida(-item.cantidad);
                await this.productoRepository.modificarStock(item.producto.id, producto);//
                await this.productoRepository.modificarCantVendida(item.producto.id, producto);
            }
        }

        // guardo el pedido actualizado en el repo
        await this.pedidoRepository.actualizarElEstado(idPedido, pedido); //

        //mando la notificacion por cancelacion
        const factoryNotificacion = new FactoryNotificacion();
        const notificacionCreada = factoryNotificacion.crearSegunPedido(pedido);

        await this.notificacionRepository.create(notificacionCreada);

        return pedido;
    }


    async historialPorUsuario(id) {
        const pedido = await this.pedidoRepository.buscarPorUsuarioId(id);
        return pedido;
    }


    async enviar(idPedido, idUsuario, motivo) {
        const pedido = await this.pedidoRepository.buscarPorId(idPedido);

        if (!pedido) {
            throw new ErrorDeBusquedaid(`Pedido con id ${idPedido} no encontrado`);
        }

        if (pedido.estado !== EstadoPedido.CONFIRMADO) {
            throw new ErrorDeEstado(`No se puede enviar un pedido en estado ${pedido.estado}`);
        }

        //actualizo estado pedido
        pedido.actualizarEstado(EstadoPedido.ENVIADO, idUsuario, motivo);

        // guardo el pedido actualizado en el repo
        await this.pedidoRepository.actualizarElEstado(idPedido, pedido);

        //mando la notificacion por cancelacion
        const factoryNotificacion = new FactoryNotificacion();
        const notificacionCreada = factoryNotificacion.crearSegunPedido(pedido);

        await this.notificacionRepository.create(notificacionCreada);

        return pedido;
    }

    async confirmar(idPedido, idUsuario, motivo) {
        const pedido = await this.pedidoRepository.buscarPorId(idPedido);

        if (!pedido) {
            throw new ErrorDeBusquedaid(`Pedido con id ${idPedido} no encontrado`);
        }
        if (pedido.estado !== EstadoPedido.PENDIENTE) {
            throw new ErrorDeEstado(`No se puede confirmar un pedido en estado ${pedido.estado}`);
        }
        pedido.actualizarEstado(EstadoPedido.CONFIRMADO, idUsuario, motivo);
        await this.pedidoRepository.actualizarElEstado(idPedido, pedido);

        //la consigna no pide mandar notificacion
        
        return pedido;
    }

}