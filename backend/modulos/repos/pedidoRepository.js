import { PedidoModel } from "../../schemas/pedidoSchema.js";

export class PedidoRepository {
    constructor() {
        this.model = PedidoModel;
    }

    async crear(pedido) {
        const nuevoPedido = new this.model(pedido);
        return await nuevoPedido.save();
    }

    async buscarPorId(id) {
       return await this.model.findById(id).populate('items.producto');
    }

    async buscarPorUsuarioId(id) {
        return await this.model.find({ comprador: id }).populate('items.producto');
    }

    async actualizarElEstado(id, pedido) {
      return await this.model.findByIdAndUpdate(id, { estado: pedido.estado, historialEstados: pedido.historialEstados }, { new: true}).populate('items.producto');
    }

}

