/* =========================================================================
   CalculaMX · TASAS DE INVERSIÓN — referencia para la calculadora de rendimientos
   -------------------------------------------------------------------------
   ⚠️  CAMBIAN SEGUIDO: revisar cada 1–2 semanas (CETES, cada martes).

   Fuentes:
     · CETES ....... Subasta semanal de Banxico (martes). cetesdirecto.com
     · Nu .......... blog.nu.com.mx (tasas y GAT de Cajitas)
     · Otras apps .. sitio de cada institución y comparadores (tasas.mx),
                     verificados en la fecha de abajo.

   Cada opción:
     tipo: 'vista'  → el rendimiento se paga y capitaliza cada día.
           'plazo'  → se paga al vencer el plazo y se reinvierte.
     base: días del año que usa la institución (CETES 360; las demás 365).
     tramos: tasa anual por rango de saldo; el último va sin tope.
   ========================================================================= */

const TASAS_INVERSION = {
  revisado: '8 de octubre de 2026',
  subastaCetes: '6 de octubre de 2026',
  inflacionEsperada: 4.0, /* % anual; implícita en la GAT real que publica Nu */

  opciones: [
    { id: 'cetes28', grupo: 'CETES (Gobierno de México)', nombre: 'CETES 28 días', tipo: 'plazo', plazoDias: 28, base: 360,
      tramos: [{ tasa: 6.09 }],
      liquidez: 'Cada 28 días', proteccion: 'Gobierno Federal',
      condicion: 'En cetesdirecto.com desde $100. Al vencer se reinvierte.' },
    { id: 'cetes91', grupo: 'CETES (Gobierno de México)', nombre: 'CETES 91 días', tipo: 'plazo', plazoDias: 91, base: 360,
      tramos: [{ tasa: 6.78 }],
      liquidez: 'Cada 91 días', proteccion: 'Gobierno Federal',
      condicion: 'En cetesdirecto.com desde $100.' },
    { id: 'cetes182', grupo: 'CETES (Gobierno de México)', nombre: 'CETES 182 días', tipo: 'plazo', plazoDias: 182, base: 360,
      tramos: [{ tasa: 6.91 }],
      liquidez: 'Cada 182 días', proteccion: 'Gobierno Federal',
      condicion: 'En cetesdirecto.com desde $100.' },
    { id: 'cetes364', grupo: 'CETES (Gobierno de México)', nombre: 'CETES 364 días', tipo: 'plazo', plazoDias: 364, base: 360,
      tramos: [{ tasa: 7.44 }],
      liquidez: 'Cada 364 días', proteccion: 'Gobierno Federal',
      condicion: 'En cetesdirecto.com desde $100.' },

    { id: 'nu247', grupo: 'Nu', nombre: 'Nu · Cajita 24/7', tipo: 'vista', base: 365,
      tramos: [{ tasa: 6.50 }],
      liquidez: 'Inmediata', proteccion: 'IPAB (400 mil UDIs)',
      condicion: 'Sin monto mínimo.' },
    { id: 'nuturbo', grupo: 'Nu', nombre: 'Nu · Cajita Turbo', tipo: 'vista', base: 365,
      tramos: [{ hasta: 25000, tasa: 13.00 }, { tasa: 6.50 }],
      liquidez: 'Inmediata', proteccion: 'IPAB (400 mil UDIs)',
      condicion: '13 % hasta $25,000 si haces al menos una compra al mes con tu tarjeta Nu (promoción hasta el 18 de noviembre de 2026). Lo que pase de $25,000 lo calculamos en la Cajita 24/7.' },
    { id: 'nu28', grupo: 'Nu', nombre: 'Nu · Ahorro congelado 28 días', tipo: 'plazo', plazoDias: 28, base: 365,
      tramos: [{ tasa: 6.60 }],
      liquidez: 'Cada 28 días', proteccion: 'IPAB (400 mil UDIs)',
      condicion: 'Desde $50.' },
    { id: 'nu90', grupo: 'Nu', nombre: 'Nu · Ahorro congelado 90 días', tipo: 'plazo', plazoDias: 90, base: 365,
      tramos: [{ tasa: 6.70 }],
      liquidez: 'Cada 90 días', proteccion: 'IPAB (400 mil UDIs)',
      condicion: 'Desde $50.' },
    { id: 'nu180', grupo: 'Nu', nombre: 'Nu · Ahorro congelado 180 días', tipo: 'plazo', plazoDias: 180, base: 365,
      tramos: [{ tasa: 6.80 }],
      liquidez: 'Cada 180 días', proteccion: 'IPAB (400 mil UDIs)',
      condicion: 'Desde $50.' },

    { id: 'mercadopago', grupo: 'Otras apps', nombre: 'Mercado Pago', tipo: 'vista', base: 365,
      tramos: [{ hasta: 25000, tasa: 12.00 }, { tasa: 0 }],
      liquidez: 'Inmediata', proteccion: 'Revisa en la app',
      condicion: '12 % hasta $25,000 si cumples el reto del mes (ingresar o gastar un mínimo); si no, hasta 6 %. Con Meli+ (de pago) hasta 15 % en Apartados. Lo que pase de $25,000 no lo contamos: revisa en la app si te paga algo.' },
    { id: 'openbank', grupo: 'Otras apps', nombre: 'Openbank · Cuenta Open', tipo: 'vista', base: 365,
      tramos: [{ hasta: 30000, tasa: 13.00 }, { hasta: 1000000, tasa: 7.00 }, { tasa: 6.50 }],
      liquidez: 'Inmediata', proteccion: 'IPAB (400 mil UDIs)',
      condicion: '13 % hasta $30,000, 7 % hasta $1 millón y 6.5 % lo demás, con la cuenta Open+ y el dinero en apartados.' },
    { id: 'didi', grupo: 'Otras apps', nombre: 'DiDi Cuenta', tipo: 'vista', base: 365,
      tramos: [{ hasta: 10000, tasa: 15.00 }, { tasa: 7.00 }],
      liquidez: 'Inmediata', proteccion: 'Prosofipo (25 mil UDIs)',
      condicion: '15 % hasta $10,000 y 7 % lo demás, sin membresía.' },
    { id: 'klar', grupo: 'Otras apps', nombre: 'Klar · Inversión flexible', tipo: 'vista', base: 365,
      tramos: [{ tasa: 6.00 }],
      liquidez: 'Inmediata', proteccion: 'Prosofipo (25 mil UDIs)',
      condicion: '6 % sin membresía; 8 % con Klar Plus o Platino (de pago).' }
  ]
};

if (typeof window !== 'undefined') window.TASAS_INVERSION = TASAS_INVERSION;
