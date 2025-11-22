import { Producto } from '../../modulos/dominio/producto.js';
import { crearUsuario } from '../../modulos/dominio/usuario.js';
import { TipoDeUsuario } from '../../modulos/dominio/tipoDeUsuario.js';
import { Moneda } from '../../modulos/dominio/moneda.js';
import {ErrorDeStock} from '../../errores/errorDeStock.js';

describe('Producto', () => {
    let producto;
    const vendedor = crearUsuario('vendedor-001', 'Juan Perez', 'juanperez@gmail.com', '1112345678', TipoDeUsuario.VENDEDOR, new Date('2025-08-22'));

    beforeEach(() => {
        // Se ejecuta antes de cada test para tener un estado limpio
        producto = new Producto(vendedor, 'Zapatillas Deportivas', 'Zapatillas para correr', [], 120, Moneda.DOLAR_USA, 10, [], null, 10);
    });

    describe('`estaDisponible()`', () => {
        test('debe retornar true si el stock es suficiente', () => {
            expect(producto.estaDisponible(5)).toBe(true);
        });

        test('debe retornar true si el stock es justo', () => {
            expect(producto.estaDisponible(10)).toBe(true);
        });

        test('debe retornar false si el stock es insuficiente', () => {
            expect(producto.estaDisponible(15)).toBe(false);
        });
    });

    describe('`reducirStock()`', () => {
        test('debe reducir el stock correctamente para un valor válido', () => {
            producto.reducirStock(5);
            expect(producto.stock).toBe(5);
        });

        test('debe reducir el stock a cero cuando se reduce al límite', () => {
            producto.reducirStock(10);
            expect(producto.stock).toBe(0);
        });

        test('debe lanzar un error si se intenta reducir el stock más allá de lo disponible', () => {
            expect(() => producto.reducirStock(11)).toThrow(ErrorDeStock); // Usa toThrow para errores
        });
    });

    describe('`aumentarStock()`', () => {
        test('debe aumentar el stock correctamente', () => {
            producto.aumentarStock(10);
            expect(producto.stock).toBe(20);
        });

        test('no debe cambiar el stock si se aumenta en 0 unidades', () => {
            const initialStock = producto.stock;
            producto.aumentarStock(0);
            expect(producto.stock).toBe(initialStock);
        });
    });
});