/* =========================================================================
   CalculaMX · Calculadora de RESICO (honorarios, personas físicas)
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, F = window.FISCAL, fmt = window.CalculaMX;

  var form = $('#resico-form');
  if (!form) return;
  var out = $('#resico-result');

  function calcular(e) {
    if (e) e.preventDefault();

    var ingreso = fmt.parse($('#resico-ingreso').value);
    var facturaAMoral = $('#resico-persona-moral').checked;
    var cobraIva = $('#resico-iva').checked;

    if (!(ingreso > 0)) {
      out.innerHTML = '<p class="result-empty">Ingresa cuánto cobraste este mes para calcular.</p>';
      return;
    }

    var tasa = F.resicoTasa(ingreso);
    var isrCausado = ingreso * (tasa / 100);
    var retencionCliente = facturaAMoral ? ingreso * D.resicoRetencionISR : 0;
    var isrPagar = Math.max(0, isrCausado - retencionCliente);
    var creditoExcedente = retencionCliente > isrCausado ? retencionCliente - isrCausado : 0;

    var iva = cobraIva ? ingreso * D.iva : 0;
    var totalFactura = ingreso + iva;

    var ingresoAnualEstimado = ingreso * 12;
    var cercaDelTope = ingresoAnualEstimado >= D.resicoTopeAnual * 0.8;
    var rebasaTope = ingresoAnualEstimado > D.resicoTopeAnual;

    var rows = '';
    rows += fila('Ingresos del mes (sin IVA)', ingreso);
    rows += filaTexto('Tasa RESICO aplicable', fmt.pct(tasa));
    rows += fila('ISR causado del mes', -isrCausado);
    if (facturaAMoral) rows += fila('Retención de ISR del cliente (1.25%)', retencionCliente, 'pos');
    rows += filaFuerte('ISR a pagar en tu declaración mensual', isrPagar);
    if (creditoExcedente > 0) rows += fila('Retención a favor para meses futuros', creditoExcedente, 'pos');
    if (cobraIva) {
      rows += fila('IVA a trasladar (16%)', iva);
      rows += filaFuerte('Total a cobrar en tu factura', totalFactura);
    }

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main">' + fmt.mxn(isrPagar) + '</p>' +
      '<p class="result-sub">ISR a pagar este mes · tasa RESICO ' + fmt.pct(tasa) + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      (rebasaTope
        ? '<p class="result-note" style="color:var(--coral);">⚠️ Con este ritmo mensual superarías los ' + fmt.mxn(D.resicoTopeAnual) + ' anuales: dejarías de calificar para RESICO a partir del mes siguiente a que lo superes.</p>'
        : cercaDelTope
          ? '<p class="result-note" style="color:var(--coral);">Vas cerca del tope anual de RESICO (' + fmt.mxn(D.resicoTopeAnual) + '). Lleva la cuenta de tu ingreso acumulado del año.</p>'
          : '') +
      '<p class="result-note">RESICO aplica una tasa fija sobre el 100% de tu ingreso cobrado (no hay deducciones de gastos). ' +
      'Estimación educativa con la tabla RESICO ' + D.anioVigente + '; presenta tu pago provisional en el portal del SAT.</p>';

    fmt.track('calculo_resico', { factura_moral: facturaAMoral });
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fila(label, monto, cls) {
    cls = cls || (monto < 0 ? 'neg' : '');
    return '<tr><td>' + label + '</td><td class="' + cls + '">' + fmt.mxn(monto) + '</td></tr>';
  }
  function filaTexto(label, texto) {
    return '<tr><td>' + label + '</td><td>' + texto + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  form.addEventListener('submit', calcular);
})();
