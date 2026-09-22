/* =========================================================================
   CalculaMX · Calculadora de declaración anual (personas físicas, sueldos)
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, F = window.FISCAL, fmt = window.CalculaMX;

  var form = $('#decl-form');
  if (!form) return;
  var out = $('#decl-result');

  function calcular(e) {
    if (e) e.preventDefault();

    var ingreso = fmt.parse($('#decl-ingreso').value);
    var isrRetenido = fmt.parse($('#decl-isr-retenido').value);
    var gastosGenerales = fmt.parse($('#decl-gastos-generales').value);
    var donativos = fmt.parse($('#decl-donativos').value);
    var aportaciones = fmt.parse($('#decl-aportaciones').value);

    if (!(ingreso > 0)) {
      out.innerHTML = '<p class="result-empty">Ingresa tu ingreso gravable anual para calcular.</p>';
      return;
    }

    var P = D.deduccionesPersonales;
    var umaAnual = D.umaAnual;

    /* Canasta general: médicos, funerarios, seguros, transporte escolar, intereses hipotecarios. */
    var topeCanasta = Math.min(P.topeUMAsAnuales * umaAnual, ingreso * P.topePorcentajeIngreso);
    var canastaDeducible = Math.min(gastosGenerales, Math.max(0, topeCanasta));

    /* Colegiaturas: tope independiente por estudiante/nivel. */
    var colTotal = 0, colFilas = [];
    ['1', '2'].forEach(function (n) {
      var nivel = $('#decl-col-nivel' + n).value;
      var monto = fmt.parse($('#decl-col-monto' + n).value);
      if (!nivel || !(monto > 0)) return;
      var tope = D.colegiaturas[nivel];
      var deducible = Math.min(monto, tope);
      colTotal += deducible;
      colFilas.push({ nivel: nivelTexto(nivel), monto: monto, tope: tope, deducible: deducible });
    });

    /* Donativos: tope independiente (7% del ingreso, aproximado con el ingreso del mismo año). */
    var topeDonativos = ingreso * P.donativosPorcentajeIngreso;
    var donativosDeducibles = Math.min(donativos, Math.max(0, topeDonativos));

    /* Aportaciones voluntarias de retiro: tope independiente. */
    var topeAportaciones = Math.min(ingreso * P.aportacionesRetiroPorcentajeIngreso, P.aportacionesRetiroTopeUMAsAnuales * umaAnual);
    var aportacionesDeducibles = Math.min(aportaciones, Math.max(0, topeAportaciones));

    var totalDeducciones = canastaDeducible + colTotal + donativosDeducibles + aportacionesDeducibles;
    var baseGravable = Math.max(0, ingreso - totalDeducciones);
    var isrCausado = F.isr(baseGravable, D.tarifaAnual);
    var saldo = isrRetenido - isrCausado;
    var aFavor = saldo > 0;

    var rows = '';
    rows += fila('Ingreso gravable anual', ingreso);
    rows += fila('Gastos médicos, funerarios, seguros e intereses hipotecarios (tope ' + fmt.mxn(topeCanasta) + ')', -canastaDeducible);
    colFilas.forEach(function (c) {
      rows += fila('Colegiatura ' + c.nivel + ' (tope ' + fmt.mxn(c.tope) + ')', -c.deducible);
    });
    if (donativos > 0) rows += fila('Donativos (tope ' + fmt.mxn(topeDonativos) + ')', -donativosDeducibles);
    if (aportaciones > 0) rows += fila('Aportaciones voluntarias de retiro (tope ' + fmt.mxn(topeAportaciones) + ')', -aportacionesDeducibles);
    rows += filaFuerte('Base gravable', baseGravable);
    rows += fila('ISR del ejercicio (tarifa anual, art. 152)', isrCausado);
    rows += fila('ISR ya retenido durante el año', isrRetenido);
    rows += filaFuerte(aFavor ? 'Saldo a favor estimado' : 'Saldo a cargo estimado', Math.abs(saldo));

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main ' + (aFavor ? 'pos' : '') + '">' + fmt.mxn(Math.abs(saldo)) + '</p>' +
      '<p class="result-sub">' + (aFavor ? 'A tu favor — podrías recibirlo por transferencia si presentas tu declaración' : 'A cargo — tendrías que pagar esta diferencia') + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      '<p class="result-note">Total deducido: ' + fmt.mxn(totalDeducciones) + '. Estimación con la tarifa ISR ' + D.anioVigente +
      ' y los topes vigentes de deducciones personales. No incluye otros tipos de ingreso (honorarios, arrendamiento, actividad empresarial) ' +
      'ni el tope de donativos calculado sobre el ingreso del año anterior (aquí se aproxima con el ingreso del mismo año). ' +
      'Para presentar tu declaración real usa el portal del SAT; esto es solo una estimación educativa.</p>';

    fmt.track('calculo_declaracion_anual', { a_favor: aFavor });
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function nivelTexto(v) {
    return {
      preescolar: 'preescolar', primaria: 'primaria', secundaria: 'secundaria',
      profesionalTecnico: 'profesional técnico', bachillerato: 'bachillerato'
    }[v] || v;
  }
  function fila(label, monto) {
    return '<tr><td>' + label + '</td><td class="' + (monto < 0 ? 'neg' : '') + '">' + fmt.mxn(monto) + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  form.addEventListener('submit', calcular);
})();
