import { Notificacion } from '../../modulos/dominio/notificacion.js';
import { crearUsuario } from '../../modulos/dominio/usuario.js';
import { TipoDeUsuario } from '../../modulos/dominio/tipoDeUsuario.js';

describe('Notificacion', () => {
        let notificacion, comprador;

        beforeEach(() => {
            comprador = crearUsuario(1, "Paula", "paula@email.com", "12345678", TipoDeUsuario.COMPRADOR, new Date());
            notificacion = new Notificacion(1, comprador, 'Tu pedido ha sido enviado', new Date(), false, null);
        });

        test('debe marcar la notificación como leída y actualizar la fecha', () => {
            notificacion.marcarComoLeida();
            expect(notificacion.leida).toBe(true);
            expect(notificacion.fechaLeida).toBeInstanceOf(Date);
            expect(notificacion.fechaLeida).not.toBeNull();
        });
    });