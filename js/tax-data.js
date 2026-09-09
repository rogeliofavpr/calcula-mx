/* =========================================================================
   CalculaMX · DATOS FISCALES — FUENTE ÚNICA
   -------------------------------------------------------------------------
   ⚠️  REVISAR Y ACTUALIZAR CADA AÑO (enero–febrero).

   Fuentes oficiales:
     · Tarifas ISR ......... Anexo 8 de la Resolución Miscelánea Fiscal (DOF
                             28/12/2025) y arts. 96, 96-bis y 152 de la LISR.
     · UMA ................. INEGI, DOF 08/01/2026 (vigente desde 01/02/2026).
     · Salario mínimo ..... CONASAMI, DOF 09/12/2025 (vigente desde 01/01/2026).
     · Subsidio al empleo . Decreto DOF 01/05/2024 + actualización 2026.

   ÚLTIMA REVISIÓN DE ESTOS VALORES:  2026-09-08  (ejercicio 2026)
   ========================================================================= */

const DATOS_FISCALES = {

  /* Ejercicio fiscal al que corresponden las tarifas mostradas. */
  anioVigente: 2026,
  /* Fecha legible de la última revisión de estos datos. */
  revisado: '8 de septiembre de 2026',

  /* UMA — Unidad de Medida y Actualización, 2026. */
  umaDiaria: 117.31,
  umaMensual: 3566.22,   /* diaria × 30.4 (publicada por INEGI) */
  umaAnual: 42794.64,

  /* Salario mínimo general diario, 2026 (Zona Libre de la Frontera Norte: 440.87). */
  salarioMinimoDiario: 315.04,
  salarioMinimoZLFN: 440.87,

  /* Aguinaldo. */
  diasAguinaldoLey: 15,          /* LFT art. 87 */
  diasExentosAguinaldo: 30,      /* LISR art. 93, fr. XIV: 30 × UMA diaria */

  /* Subsidio para el empleo 2026 (esquema mensual vigente desde 01/05/2024).
     Monto fijo mensual (feb–dic; enero tuvo cuota transitoria de $536.21)
     aplicable cuando el ingreso mensual gravable no rebasa el tope.
     Monto = 15.02% de la UMA mensual. */
  subsidioEmpleo: {
    montoMensual: 535.65,
    ingresoTopeMensual: 11492.66
  },

  /* IVA aplicable a intereses de créditos al consumo. */
  iva: 0.16,

  /* -----------------------------------------------------------------------
     TARIFA ISR — Art. 96 LISR, ejercicio 2026 (Anexo 8 RMF, DOF 28/12/2025).
     Filas: [límite inferior, límite superior, cuota fija, % sobre excedente]
     La tarifa de 2024–2025 se actualizó por inflación acumulada (factor
     ~1.1321); los porcentajes marginales no cambiaron.
     ----------------------------------------------------------------------- */
  tarifaMensual: [
    [0.01,       844.59,    0,         1.92],
    [844.60,     7168.51,   16.22,     6.40],
    [7168.52,    12598.02,  420.95,    10.88],
    [12598.03,   14644.64,  1011.68,   16.00],
    [14644.65,   17533.64,  1339.14,   17.92],
    [17533.65,   35362.83,  1856.84,   21.36],
    [35362.84,   55736.68,  5665.16,   23.52],
    [55736.69,   106410.50, 10457.09,  30.00],
    [106410.51,  141880.66, 25659.23,  32.00],
    [141880.67,  425641.99, 37009.69,  34.00],
    [425642,     Infinity,  133488.54, 35.00]
  ],

  /* TARIFA ISR quincenal — Art. 96 LISR, ejercicio 2026. */
  tarifaQuincenal: [
    [0.01,       416.70,    0,         1.92],
    [416.71,     3537.15,   7.95,      6.40],
    [3537.16,    6216.15,   207.75,    10.88],
    [6216.16,    7225.95,   499.20,    16.00],
    [7225.96,    8651.40,   660.75,    17.92],
    [8651.41,    17448.75,  916.20,    21.36],
    [17448.76,   27501.60,  2795.25,   23.52],
    [27501.61,   52505.25,  5159.70,   30.00],
    [52505.26,   70006.95,  12660.75,  32.00],
    [70006.96,   210020.70, 18261.30,  34.00],
    [210020.71,  Infinity,  65866.05,  35.00]
  ]
};

/* TARIFA ISR anual — Art. 152 LISR. Se obtiene de la tarifa mensual × 12,
   que es como la publican el SAT y el DOF para el ejercicio 2026. */
DATOS_FISCALES.tarifaAnual = DATOS_FISCALES.tarifaMensual.map(function (r) {
  return [
    r[0] === 0.01 ? 0.01 : +(r[0] * 12).toFixed(2),
    r[1] === Infinity ? Infinity : +(r[1] * 12).toFixed(2),
    +(r[2] * 12).toFixed(2),
    r[3]
  ];
});

/* =========================================================================
   FISCAL — utilidades de cálculo compartidas por las calculadoras.
   ========================================================================= */
const FISCAL = {

  /* ISR conforme a una tarifa ([li, ls, cuota, pct]). */
  isr(base, tarifa) {
    if (!(base > 0)) return 0;
    for (let i = 0; i < tarifa.length; i++) {
      const r = tarifa[i];
      if (base >= r[0] && base <= r[1]) {
        return r[2] + (base - r[0]) * (r[3] / 100);
      }
    }
    return 0;
  },

  /* Tarifa por nombre de periodo. */
  tarifa(periodo) {
    if (periodo === 'quincenal') return DATOS_FISCALES.tarifaQuincenal;
    if (periodo === 'anual') return DATOS_FISCALES.tarifaAnual;
    return DATOS_FISCALES.tarifaMensual;
  },

  /* Subsidio para el empleo del periodo (sólo mensual/quincenal). */
  subsidio(baseGravable, periodo) {
    const s = DATOS_FISCALES.subsidioEmpleo;
    if (periodo === 'mensual' && baseGravable <= s.ingresoTopeMensual) {
      return s.montoMensual;
    }
    if (periodo === 'quincenal' && baseGravable <= s.ingresoTopeMensual / 2) {
      return s.montoMensual / 2;
    }
    return 0;
  },

  /* Cuota obrero del IMSS (mensual) estimada a partir de un SBC mensual.
     Cálculo simplificado; el SBC se topa a 25 UMA diarias.
     Ramas y % sobre SBC (cuota del trabajador):
       Enf. y mat. — excedente de 3 UMA (especie) .... 0.40%
       Enf. y mat. — prestaciones en dinero .......... 0.25%
       Gastos médicos pensionados .................... 0.375%
       Invalidez y vida ............................. 0.625%
       Cesantía en edad avanzada y vejez ............ 1.125% */
  imssMensual(sbcMensual) {
    const umaMes = DATOS_FISCALES.umaMensual;
    const topeMes = DATOS_FISCALES.umaDiaria * 25 * 30.4;
    const sbc = Math.min(Math.max(0, sbcMensual), topeMes);
    const excedente = Math.max(0, sbc - 3 * umaMes);
    return excedente * 0.004 + sbc * (0.0025 + 0.00375 + 0.00625 + 0.01125);
  }
};

if (typeof window !== 'undefined') {
  window.DATOS_FISCALES = DATOS_FISCALES;
  window.FISCAL = FISCAL;
}
