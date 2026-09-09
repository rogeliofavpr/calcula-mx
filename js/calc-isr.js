/* =========================================================================
   CalculaMX · Calculadora de ISR (retención sobre sueldos y salarios)
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, F = window.FISCAL, fmt = window.CalculaMX;

  var form = $('#isr-form');
  if (!form) return;
  var out = $('#isr-result');

  function periodoTexto(p) {
    return p === 'quincenal' ? 'quincenal' : (p === 'anual' ? 'anual' : 'mensual');
  }

  function calcular(e) {
    if (e) e.preventDefault();
    var bruto = fmt.parse($('#isr-income').value);
    var periodo = $('#isr-period').value;
    var conImss = $('#isr-imss').checked;

    if (!(bruto > 0)) {
      out.innerHTML = '<p class="result-empty">Ingresa un salario mayor a cero.</p>';
      return;
    }

    var tarifa = F.tarifa(periodo);
    var isrCausado = F.isr(bruto, tarifa);
    var subsidio = F.subsidio(bruto, periodo);
    var isrRetener = Math.max(0, isrCausado - subsidio);
    var subsidioEfectivo = subsidio > isrCausado ? subsidio - isrCausado : 0;

    var imss = 0;
    if (conImss) {
      var brutoMensual = periodo === 'anual' ? bruto / 12
                        : (periodo === 'quincenal' ? bruto * 2 : bruto);
      imss = F.imssMensual(brutoMensual * 1.0452);
      if (periodo === 'anual') imss *= 12;
      else if (periodo === 'quincenal') imss /= 2;
    }

    var neto = bruto - isrRetener - imss + subsidioEfectivo;
    var tasa = (isrRetener / bruto) * 100;
    var pTxt = periodoTexto(periodo);

    var rows = '';
    rows += fila('Salario bruto ' + pTxt, bruto);
    rows += fila('ISR según tarifa (art. ' + (periodo === 'anual' ? '152' : '96') + ')', -isrCausado);
    if (subsidio > 0) rows += fila('Subsidio para el empleo', subsidio, 'pos');
    rows += filaFuerte('ISR a retener', -isrRetener);
    if (subsidioEfectivo > 0) rows += fila('Subsidio entregado en efectivo', subsidioEfectivo, 'pos');
    if (conImss) rows += fila('Cuota IMSS del trabajador (estimada)', -imss);

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main">' + fmt.mxn(neto) + '</p>' +
      '<p class="result-sub">Salario neto ' + pTxt + ' estimado · tasa efectiva de ISR ' + fmt.pct(tasa) + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      '<p class="result-note">Cálculo con la tarifa ISR ' + D.anioVigente +
      (conImss ? ' y cuotas IMSS vigentes' : '') +
      '. Es una estimación educativa; tu recibo de nómina puede variar por percepciones ' +
      'exentas, cálculo por periodos o ajuste anual.</p>';

    fmt.track('calculo_isr', { periodo: periodo, con_imss: conImss });
  }

  function fila(label, monto, cls) {
    var c = monto < 0 ? 'neg' : (cls || '');
    return '<tr><td>' + label + '</td><td class="' + c + '">' + fmt.mxn(monto) + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  form.addEventListener('submit', calcular);
  form.addEventListener('input', function () { if (out.dataset.done) calcular(); });
  form.addEventListener('submit', function () { out.dataset.done = '1'; });
})();
