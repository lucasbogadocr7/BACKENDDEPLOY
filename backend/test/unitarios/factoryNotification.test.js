import { EstadoPedido } from '../../modulos/dominio/estadoPedido.js';
import { FactoryNotificacion } from '../../modulos/dominio/factoryNotification.js';

describe('Notificacion y FactoryNotificacion', () => {
    describe('FactoryNotificacion', () => {
        let factory;

        beforeAll(() => {
            factory = new FactoryNotificacion();
        });

        test('debe crear la notificación correcta para el estado CONFIRMADO', () => {
            expect(factory.crearSegunEstadoPedido(EstadoPedido.CONFIRMADO)).toBe("NOTIFICACION_NUEVO_PEDIDO");
        });

        test('debe crear la notificación correcta para el estado ENVIADO', () => {
            expect(factory.crearSegunEstadoPedido(EstadoPedido.ENVIADO)).toBe("NOTIFICACION_PEDIDO_ENVIADO");
        });

        test('debe crear la notificación correcta para el estado CANCELADO', () => {
            expect(factory.crearSegunEstadoPedido(EstadoPedido.CANCELADO)).toBe("NOTIFICACION_PEDIDO_CANCELADO");
        });
    });
});