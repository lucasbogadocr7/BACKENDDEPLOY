export class ItemPedido {
    constructor(producto, cantidad, precioUnitario) {
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }

    subtotal() {
        return this.cantidad * this.precioUnitario;
    }

    hayStock() {
        return this.producto.estaDisponible(this.cantidad);
    }
}