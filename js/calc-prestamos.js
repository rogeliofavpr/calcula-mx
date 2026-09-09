/* =========================================================================
   CalculaMX · Simulador de préstamo (amortización francesa) + CAT estimado
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, fmt = window.CalculaMX;
  var IVA = D.iva;

  var form = $('#loan-form');
  if (!form) return;
  var out = $('#loan-result');
  var tabla = $('#loan-tabla');

  function pagoFijo(monto, i, n) {
    return i === 0 ? monto / n : monto * i / (1 - Math.pow(1 + i, -n));
  }

  /* CAT: tasa mensual que iguala el valor presente de los pagos con el monto
     neto recibido; se anualiza (1+i)^12 − 1. Bisección. Sin considerar IVA. */
  function catAnual(montoNeto, pagoMensual, n) {
    var f = function (i) {
      var vp = 0;
      for (var k = 1; k <= n; k++) vp += pagoMensual / Math.pow(1 + i, k);
      return vp - montoNeto;
    };
    var lo = 1e-7, hi = 1;
    if (f(lo) * f(hi) > 0) return null;
    for (var it = 0; it < 200; it++) {
      var mid = (lo + hi) / 2;
      if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
    }
    return Math.pow(1 + (lo + hi) / 2, 12) - 1;
  }

  function calcular(e) {
    if (e) e.preventDefault();
    var monto = fmt.parse($('#loan-amount').value);
    var tasaAnual = fmt.parse($('#loan-rate').value) / 100;
    var meses = Math.round(fmt.parse($('#loan-months').value));
    var comisionPct = fmt.parse($('#loan-fee').value) / 100;
    var conIva = $('#loan-iva').checked;

    if (!(monto > 0) || !(meses > 0)) {
      out.innerHTML = '<p class="result-empty">Ingresa monto, tasa y plazo.</p>';
      tabla.innerHTML = '';
      return;
    }

    var i = tasaAnual / 12;
    var comision = monto * comisionPct;
    var pagoBase = pagoFijo(monto, i, meses);

    var saldo = monto, totInteres = 0, totIva = 0, totPagado = 0, totSinIva = 0;
    var filas = [];
    for (var m = 1; m <= meses; m++) {
      var interes = saldo * i;
      var iva = conIva ? interes * IVA : 0;
      var capital = m === meses ? saldo : pagoBase - interes;
      var cuota = capital + interes + iva;
      saldo = Math.max(0, saldo - capital);
      totInteres += interes; totIva += iva; totPagado += cuota; totSinIva += capital + interes;
      filas.push('<tr><td>' + m + '</td><td>' + fmt.num(cuota) + '</td><td>' +
        fmt.num(capital) + '</td><td>' + fmt.num(interes) +
        (conIva ? '</td><td>' + fmt.num(iva) : '') +
        '</td><td>' + fmt.num(saldo) + '</td></tr>');
    }

    var pagoProm = totPagado / meses;
    var montoNeto = monto - comision;
    var cat = catAnual(montoNeto, totSinIva / meses, meses);

    var rows = '';
    rows += fila('Monto del préstamo', monto);
    if (comision > 0) {
      rows += fila('Comisión de apertura (' + fmt.pct(comisionPct * 100) + ')', -comision);
      rows += fila('Recibes en efectivo', montoNeto);
    }
    rows += fila('Pago mensual' + (conIva ? ' (promedio; baja con el tiempo)' : ''), pagoProm);
    rows += fila('Total de intereses', totInteres);
    if (conIva) rows += fila('Total de IVA sobre intereses', totIva);
    rows += filaFuerte('Total a pagar', totPagado);

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main">' + fmt.mxn(pagoProm) + '<span> / mes</span></p>' +
      '<p class="result-sub">' + meses + ' meses' +
      (cat != null ? ' · CAT estimado ' + fmt.pct(cat * 100) + ' sin IVA' : '') + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      '<p class="result-note">Sistema de amortización francés (pago fijo). El CAT real que ' +
      'te informe la institución puede ser mayor por seguros y otros cargos (CONDUSEF). Estimación educativa.</p>';

    var thIva = conIva ? '<th>IVA</th>' : '';
    tabla.innerHTML =
      '<h2>Tabla de amortización</h2>' +
      '<div class="table-scroll"><table class="amort"><thead><tr><th>Mes</th><th>Pago</th>' +
      '<th>Capital</th><th>Interés</th>' + thIva + '<th>Saldo</th></tr></thead><tbody>' +
      filas.join('') + '</tbody></table></div>';

    fmt.track('calculo_prestamo', { meses: meses, con_iva: conIva });
  }

  function fila(label, monto) {
    return '<tr><td>' + label + '</td><td class="' + (monto < 0 ? 'neg' : '') + '">' +
      fmt.mxn(monto) + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  form.addEventListener('submit', calcular);
  form.addEventListener('input', function () { if (out.dataset.done) calcular(); });
  form.addEventListener('submit', function () { out.dataset.done = '1'; });
})();
