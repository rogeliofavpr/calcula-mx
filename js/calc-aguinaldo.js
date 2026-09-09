/* =========================================================================
   CalculaMX · Calculadora de aguinaldo
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, F = window.FISCAL, fmt = window.CalculaMX;

  var form = $('#agui-form');
  if (!form) return;
  var out = $('#agui-result');

  function calcular(e) {
    if (e) e.preventDefault();
    var sueldoMensual = fmt.parse($('#agui-sueldo').value);
    var dias = fmt.parse($('#agui-dias').value) || D.diasAguinaldoLey;
    var trabajados = Math.min(fmt.parse($('#agui-trabajados').value) || 365, 365);

    if (!(sueldoMensual > 0)) {
      out.innerHTML = '<p class="result-empty">Ingresa tu sueldo mensual bruto.</p>';
      return;
    }

    var salarioDiario = sueldoMensual / 30;
    var diasPagar = dias * (trabajados / 365);
    var bruto = salarioDiario * diasPagar;

    var exento = Math.min(bruto, D.diasExentosAguinaldo * D.umaDiaria);
    var gravado = Math.max(0, bruto - exento);

    /* ISR de la parte gravada — método del art. 174 RLISR. */
    var isrOrdinario = F.isr(sueldoMensual, D.tarifaMensual);
    var isrConAgui = F.isr(sueldoMensual + gravado, D.tarifaMensual);
    var tasa = gravado > 0 ? (isrConAgui - isrOrdinario) / gravado : 0;
    var isrAguinaldo = gravado * tasa;
    var neto = bruto - isrAguinaldo;

    var rows = '';
    rows += fila('Salario diario (sueldo ÷ 30)', salarioDiario);
    rows += filaTexto('Días de aguinaldo a pagar', fmt.num(diasPagar, 2) + ' días');
    rows += fila('Aguinaldo bruto', bruto);
    rows += fila('Parte exenta (30 UMA)', -exento);
    rows += fila('Parte gravada', gravado);
    rows += fila('ISR del aguinaldo (tasa ' + fmt.pct(tasa * 100) + ')', -isrAguinaldo);
    rows += filaFuerte('Aguinaldo neto a recibir', neto);

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main">' + fmt.mxn(neto) + '</p>' +
      '<p class="result-sub">Aguinaldo neto · bruto ' + fmt.mxn(bruto) + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      '<p class="result-note">La ley obliga a pagar mínimo ' + D.diasAguinaldoLey +
      ' días de salario antes del 20 de diciembre (LFT art. 87). Exención con UMA ' +
      D.anioVigente + ' de ' + fmt.mxn(D.umaDiaria) + ' e ISR por el método del art. 174 RLISR. Estimación educativa.</p>';

    fmt.track('calculo_aguinaldo', {});
  }

  function fila(label, monto, cls) {
    var c = monto < 0 ? 'neg' : (cls || '');
    return '<tr><td>' + label + '</td><td class="' + c + '">' + fmt.mxn(monto) + '</td></tr>';
  }
  function filaTexto(label, texto) {
    return '<tr><td>' + label + '</td><td>' + texto + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  form.addEventListener('submit', calcular);
  form.addEventListener('input', function () { if (out.dataset.done) calcular(); });
  form.addEventListener('submit', function () { out.dataset.done = '1'; });
})();
