/* =========================================================================
   CalculaMX · Calculadora de finiquito (y liquidación si aplica)
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, F = window.FISCAL, fmt = window.CalculaMX;

  var form = $('#fini-form');
  if (!form) return;
  var out = $('#fini-result');
  var DIA_MS = 86400000;

  function parseFecha(v) {
    if (!v) return null;
    var p = v.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  /* Años completos de servicio entre dos fechas (cuenta calendario, no 365.25). */
  function aniosCompletos(ingreso, salida) {
    var a = salida.getFullYear() - ingreso.getFullYear();
    var m = salida.getMonth() - ingreso.getMonth();
    var d = salida.getDate() - ingreso.getDate();
    if (m < 0 || (m === 0 && d < 0)) a--;
    return Math.max(0, a);
  }

  /* Fecha del último aniversario laboral cumplido antes/igual a "salida". */
  function ultimoAniversario(ingreso, anios) {
    var f = new Date(ingreso.getTime());
    f.setFullYear(ingreso.getFullYear() + anios);
    return f;
  }

  function diasEntre(a, b) {
    return Math.round((b.getTime() - a.getTime()) / DIA_MS);
  }

  function calcular(e) {
    if (e) e.preventDefault();

    var sueldoMensual = fmt.parse($('#fini-sueldo').value);
    var ingreso = parseFecha($('#fini-ingreso').value);
    var salida = parseFecha($('#fini-salida').value);
    var motivo = $('#fini-motivo').value; /* renuncia | injustificado | otro */
    var diasAguiLey = fmt.parse($('#fini-dias-aguinaldo').value) || D.diasAguinaldoLey;
    var vacacionesTomadas = fmt.parse($('#fini-vac-tomadas').value) || 0;

    if (!(sueldoMensual > 0) || !ingreso || !salida || salida <= ingreso) {
      out.innerHTML = '<p class="result-empty">Completa sueldo, fecha de ingreso y fecha de salida (la salida debe ser posterior al ingreso).</p>';
      return;
    }

    var salarioDiario = sueldoMensual / 30;
    var anios = aniosCompletos(ingreso, salida);
    var aniversario = ultimoAniversario(ingreso, anios);
    var diasAnioActual = Math.min(365, Math.max(0, diasEntre(aniversario, salida) + 1));
    var fraccionAnioActual = diasAnioActual / 365;

    /* ---- Aguinaldo proporcional (año calendario, LFT art. 87) ---- */
    var inicioAnioCal = new Date(salida.getFullYear(), 0, 1);
    var inicioConteoAgui = ingreso > inicioAnioCal ? ingreso : inicioAnioCal;
    var diasAnioCal = Math.min(365, Math.max(0, diasEntre(inicioConteoAgui, salida) + 1));
    var diasAguiPagar = diasAguiLey * (diasAnioCal / 365);
    var montoAguinaldo = salarioDiario * diasAguiPagar;
    var exentoAgui = Math.min(montoAguinaldo, D.diasExentosAguinaldo * D.umaDiaria);
    var gravadoAgui = Math.max(0, montoAguinaldo - exentoAgui);
    var isrAgui = F.isrPagoExtraordinario(sueldoMensual, gravadoAgui);

    /* ---- Vacaciones y prima vacacional proporcionales (LFT art. 76 y 80) ---- */
    var diasVacTabla = F.diasVacacionesLFT(anios + 1);
    var diasVacGeneradas = diasVacTabla * fraccionAnioActual;
    var diasVacAPagar = Math.max(0, diasVacGeneradas - vacacionesTomadas);
    var montoVacaciones = salarioDiario * diasVacAPagar;
    var montoPrimaVacacional = montoVacaciones * D.primaVacacionalMinima;

    /* ---- Prima de antigüedad (LFT art. 162) ----
       Aplica en cualquier separación salvo renuncia voluntaria con menos
       de 15 años de servicio. Salario topado a 2 × salario mínimo diario. */
    var aplicaPrimaAntig = motivo !== 'renuncia' || anios >= 15;
    var salarioTopado = Math.min(salarioDiario, D.salarioMinimoDiario * D.primaAntiguedadToleMultiploSM);
    var diasPrimaAntig = D.diasPrimaAntiguedadPorAnio * (anios + fraccionAnioActual);
    var montoPrimaAntig = aplicaPrimaAntig ? salarioTopado * diasPrimaAntig : 0;

    /* ---- Indemnización por despido injustificado (LFT art. 48 y 50-II) ---- */
    var esInjustificado = motivo === 'injustificado';
    var montoIndemnizacion90 = esInjustificado ? salarioDiario * D.diasIndemnizacionConstitucional : 0;
    var dias20PorAnio = D.diasPorAnioDespidoInjustificado * (anios + fraccionAnioActual);
    var monto20Dias = esInjustificado ? salarioDiario * dias20PorAnio : 0;

    /* ---- ISR sobre prima de antigüedad + indemnizaciones (LISR art. 93-XIII):
       exentas hasta 90 UMA por cada año de servicio; el excedente se grava
       con el mismo método de tasa incremental. ---- */
    var totalSeparacion = montoPrimaAntig + montoIndemnizacion90 + monto20Dias;
    var exentoSeparacion = Math.min(totalSeparacion, D.umaExentaPorAnioSeparacion * D.umaDiaria * Math.max(1, anios));
    var gravadoSeparacion = Math.max(0, totalSeparacion - exentoSeparacion);
    var isrSeparacion = F.isrPagoExtraordinario(sueldoMensual, gravadoSeparacion);

    var totalBruto = montoAguinaldo + montoVacaciones + montoPrimaVacacional + totalSeparacion;
    var totalIsr = isrAgui.isr + isrSeparacion.isr;
    var totalNeto = totalBruto - totalIsr;

    var rows = '';
    rows += seccion('Finiquito (aplica siempre)');
    rows += fila('Aguinaldo proporcional (' + fmt.num(diasAguiPagar, 1) + ' días)', montoAguinaldo);
    rows += fila('Vacaciones proporcionales (' + fmt.num(diasVacAPagar, 1) + ' días)', montoVacaciones);
    rows += fila('Prima vacacional (25%)', montoPrimaVacacional);
    if (aplicaPrimaAntig || esInjustificado) {
      rows += seccion('Liquidación adicional');
      if (aplicaPrimaAntig) rows += fila('Prima de antigüedad (' + fmt.num(diasPrimaAntig, 1) + ' días, salario topado)', montoPrimaAntig);
      if (esInjustificado) {
        rows += fila('Indemnización constitucional (90 días)', montoIndemnizacion90);
        rows += fila('20 días por año (' + fmt.num(dias20PorAnio, 1) + ' días)', monto20Dias);
      }
    }
    rows += filaFuerte('Total bruto', totalBruto);
    rows += fila('ISR estimado sobre aguinaldo y pagos por separación', -totalIsr);
    rows += filaFuerte('Total neto estimado', totalNeto);

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main">' + fmt.mxn(totalNeto) + '</p>' +
      '<p class="result-sub">' + anios + ' año(s) completo(s) de antigüedad' +
      (esInjustificado ? ' · incluye indemnización por despido injustificado' : '') + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      '<p class="result-note">No incluye días de sueldo pendientes de pago, PTU, horas extra ni comisiones. ' +
      'La prima vacacional y las vacaciones se calcularon sin exención de ISR aparte (en la práctica suelen ' +
      'quedar cubiertas por su propio tope legal). Estimación educativa — para tu finiquito real confirma con ' +
      'RH o un abogado laboral; si hay conflicto, acude a la PROFEDET.</p>';

    fmt.track('calculo_finiquito', { motivo: motivo, anios: anios });
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function seccion(titulo) {
    return '<tr class="section"><td colspan="2">' + titulo + '</td></tr>';
  }
  function fila(label, monto) {
    return '<tr><td>' + label + '</td><td class="' + (monto < 0 ? 'neg' : '') + '">' + fmt.mxn(monto) + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  form.addEventListener('submit', calcular);
})();
