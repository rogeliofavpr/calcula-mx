/* =========================================================================
   CalculaMX · Calculadora de rendimientos (CETES, Nu, Mercado Pago y más)
   Simula día por día: interés por tramos de saldo, capitalización diaria
   (cuentas a la vista) o al vencer el plazo (CETES y plazos), retención de
   ISR sobre el capital y aportaciones mensuales.
   Requiere: tax-data.js, tasas-inversion.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var D = window.DATOS_FISCALES, T = window.TASAS_INVERSION, fmt = window.CalculaMX;

  var form = $('#rend-form');
  if (!form || !T) return;
  var out = $('#rend-result');
  var comparativo = $('#rend-comparativo');
  var selDonde = $('#rend-donde');
  var inTasa = $('#rend-tasa');
  var detalleTasa = $('#rend-detalle-tasa');
  var DIAS_MES = 365 / 12;
  var PERSONALIZADA = 'otra';

  var porId = {};
  T.opciones.forEach(function (o) { porId[o.id] = o; });

  /* ---------- Llenar la lista de opciones ---------- */
  var grupos = {};
  T.opciones.forEach(function (o) {
    if (!grupos[o.grupo]) {
      grupos[o.grupo] = document.createElement('optgroup');
      grupos[o.grupo].label = o.grupo;
      selDonde.appendChild(grupos[o.grupo]);
    }
    grupos[o.grupo].appendChild(new Option(o.nombre, o.id));
  });
  selDonde.appendChild(new Option('Otra tasa (escríbela tú)', PERSONALIZADA));
  document.querySelectorAll('[data-tasas-revisado]').forEach(function (el) { el.textContent = T.revisado; });
  document.querySelectorAll('[data-subasta-cetes]').forEach(function (el) { el.textContent = T.subastaCetes; });

  function textoTramos(o) {
    if (o.tramos.length === 1) return fmt.pct(o.tramos[0].tasa) + ' anual';
    return o.tramos.map(function (t) {
      return fmt.pct(t.tasa) + ' ' + (t.hasta ? 'hasta ' + fmt.mxn(t.hasta).replace(/\.00$/, '') : 'lo demás');
    }).join(' · ');
  }

  function opcionElegida() {
    if (selDonde.value !== PERSONALIZADA) return porId[selDonde.value];
    return {
      id: PERSONALIZADA, nombre: 'Tu tasa', tipo: 'vista', base: 365,
      tramos: [{ tasa: fmt.parse(inTasa.value) }],
      liquidez: '—', proteccion: '—', condicion: 'Tasa anual que escribiste, con rendimiento diario.'
    };
  }

  function alCambiarDonde() {
    var o = opcionElegida();
    if (o.id !== PERSONALIZADA) inTasa.value = fmt.num(o.tramos[0].tasa);
    detalleTasa.textContent = o.id === PERSONALIZADA ? 'Escribe la tasa anual que te ofrecen.' : textoTramos(o) + '. ' + o.condicion;
  }

  /* ---------- Simulación ---------- */
  /* Interés anual del saldo por tramos, y el capital que sí genera interés
     (la retención de ISR solo aplica sobre ese capital). */
  function porTramos(saldo, tramos) {
    var interes = 0, capital = 0, piso = 0;
    for (var i = 0; i < tramos.length && saldo > piso; i++) {
      var techo = tramos[i].hasta == null ? Infinity : tramos[i].hasta;
      var parte = Math.min(saldo, techo) - piso;
      interes += parte * tramos[i].tasa / 100;
      if (tramos[i].tasa > 0) capital += parte;
      piso = techo;
    }
    return { interes: interes, capital: capital };
  }

  function simular(o, p) {
    var dias = Math.round(p.meses * DIAS_MES);
    var periodo = o.tipo === 'plazo' ? o.plazoDias : 1;
    var saldo = p.inicial, pendiente = 0, aportado = p.inicial;
    var bruto = 0, retenido = 0, primerMes = 0, mesAnterior = 0;
    var diaPrimerMes = Math.round(DIAS_MES);
    for (var d = 1; d <= dias; d++) {
      var mes = Math.floor((d - 1) / DIAS_MES);
      if (mes > mesAnterior) {
        saldo += p.mensual; aportado += p.mensual; mesAnterior = mes;
      }
      var t = porTramos(saldo, o.tramos);
      var interes = t.interes / o.base;
      var retencion = p.retener ? t.capital * D.retencionIntereses / 365 : 0;
      bruto += interes; retenido += retencion;
      pendiente += interes - retencion;
      if (d % periodo === 0) { saldo += pendiente; pendiente = 0; }
      if (d === diaPrimerMes) primerMes = bruto - retenido;
    }
    var final = saldo + pendiente;
    return {
      dias: dias, aportado: aportado, bruto: bruto, retenido: retenido, final: final,
      /* Unos pocos días sueltos (un año son 13 plazos de 28 días + 1) no cuentan como plazo sin vencer. */
      primerMes: primerMes, sinVencer: o.tipo === 'plazo' && dias % o.plazoDias > 3,
      enPesosDeHoy: final / Math.pow(1 + p.inflacion / 100, dias / 365)
    };
  }

  /* Rendimiento neto en un año sobre el monto inicial, sin aportaciones. */
  function netoAnual(o, p) {
    if (!(p.inicial > 0)) return 0;
    var r = simular(o, { inicial: p.inicial, mensual: 0, meses: 12, retener: p.retener, inflacion: p.inflacion });
    return r.final / p.inicial - 1;
  }

  /* ---------- Interfaz ---------- */
  function leer() {
    return {
      inicial: fmt.parse($('#rend-monto').value),
      mensual: fmt.parse($('#rend-mensual').value),
      meses: Math.round(fmt.parse($('#rend-meses').value)),
      retener: $('#rend-retencion').checked,
      inflacion: fmt.parse($('#rend-inflacion').value)
    };
  }

  function calcular(e) {
    if (e) e.preventDefault();
    var p = leer();
    var o = opcionElegida();
    if (!(p.inicial > 0 || p.mensual > 0) || !(p.meses > 0) || !(o.tramos[0].tasa >= 0)) {
      out.innerHTML = '<p class="result-empty">Escribe cuánto vas a meter, por cuánto tiempo y dónde.</p>';
      comparativo.innerHTML = '';
      return;
    }
    var r = simular(o, p);
    var anual = netoAnual(o, p);
    var real = (1 + anual) / (1 + p.inflacion / 100) - 1;
    var ganancia = r.final - r.aportado;

    var rows = '';
    rows += fila('Dinero que metes' + (p.mensual > 0 ? ' (inicial + ' + fmt.mxn(p.mensual) + ' al mes)' : ''), r.aportado);
    rows += fila('Rendimiento antes de impuestos', r.bruto);
    if (p.retener) rows += fila('Retención de ISR (' + fmt.pct(D.retencionIntereses * 100) + ' anual sobre tu saldo)', -r.retenido);
    rows += filaFuerte('Tendrías en ' + plazoTexto(p.meses), r.final);
    rows += fila('Lo mismo, en pesos de hoy (inflación ' + fmt.pct(p.inflacion, 1) + ')', r.enPesosDeHoy);

    var avisoPlazo = r.sinVencer
      ? '<p class="callout">El último plazo de ' + o.plazoDias + ' días aún no vence al final de ' + plazoTexto(p.meses) +
        ': incluimos su rendimiento acumulado, pero ese dinero estaría disponible hasta que venza.</p>'
      : '';

    out.innerHTML =
      '<p class="result-caption">' + esc(o.nombre.toUpperCase()) + ' · GANAS AL MES</p>' +
      '<p class="result-main pos">' + fmt.mxn(r.primerMes) + '<span> / mes</span></p>' +
      '<p class="result-sub">El primer mes, ' + (p.retener ? 'después de la retención de ISR' : 'antes de impuestos') +
      '. En ' + plazoTexto(p.meses) + ' ganas ' + fmt.mxn(ganancia) + '.</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' + avisoPlazo +
      '<p class="result-note">Rinde ' + fmt.pct(anual * 100) + ' neto al año' +
      (p.inicial > 0 ? '; descontando inflación, ' + fmt.pct(real * 100) + ' real' : '') + '. ' +
      'Liquidez: ' + esc(o.liquidez) + '. Protección: ' + esc(o.proteccion) + '. ' + esc(o.condicion) +
      ' Tasas de referencia al ' + T.revisado + '; confírmalas en la app antes de invertir. Estimación educativa, no es recomendación de inversión.</p>';

    pintarComparativo(p, o.id);
    out.dataset.done = '1';
    fmt.track('calculo_rendimientos', { opcion: o.id, meses: p.meses, con_aportacion: p.mensual > 0 });
  }

  function pintarComparativo(p, elegida) {
    var filas = T.opciones.map(function (o) {
      return { o: o, r: simular(o, p), anual: netoAnual(o, p) };
    }).sort(function (a, b) { return b.r.final - a.r.final; });

    comparativo.innerHTML =
      '<h2>Compara todas las opciones</h2>' +
      '<p>Con los mismos datos: ' + (p.inicial > 0 ? fmt.mxn(p.inicial) : '') + (p.mensual > 0 ? (p.inicial > 0 ? ' + ' : '') + fmt.mxn(p.mensual) + ' al mes' : '') +
      ' durante ' + plazoTexto(p.meses) + (p.retener ? ', después de la retención de ISR' : ', antes de impuestos') + '. De mayor a menor.</p>' +
      '<div class="table-scroll"><table class="amort rend-tabla"><thead><tr>' +
      '<th>Opción</th><th>Tasa anual</th><th>Ganas al mes</th><th>Tendrías al final</th><th>Neto al año</th><th>Liquidez</th><th>Protección</th>' +
      '</tr></thead><tbody>' +
      filas.map(function (f) {
        var o = f.o;
        return '<tr' + (o.id === elegida ? ' class="elegida"' : '') + '>' +
          '<td><button type="button" class="enlace-opcion" data-opcion="' + o.id + '">' + esc(o.nombre) + '</button>' +
          '<small>' + esc(o.condicion) + '</small></td>' +
          '<td>' + esc(textoTramos(o).replace(' anual', '')) + '</td>' +
          '<td>' + fmt.mxn(f.r.primerMes) + '</td>' +
          '<td><strong>' + fmt.mxn(f.r.final) + '</strong></td>' +
          '<td>' + fmt.pct(f.anual * 100) + '</td>' +
          '<td>' + esc(o.liquidez) + '</td>' +
          '<td>' + esc(o.proteccion) + '</td></tr>';
      }).join('') +
      '</tbody></table></div>' +
      '<p class="result-note">Tasas de referencia al ' + T.revisado + ' (CETES: subasta del ' + T.subastaCetes + '). ' +
      'Cambian seguido y varias dependen de condiciones (compras al mes, membresías o topes de saldo). ' +
      'Toca el nombre de una opción para verla arriba.</p>';
  }

  function plazoTexto(meses) {
    if (meses % 12 === 0) return meses === 12 ? '1 año' : (meses / 12) + ' años';
    return meses === 1 ? '1 mes' : meses + ' meses';
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function fila(label, monto) {
    return '<tr><td>' + label + '</td><td class="' + (monto < 0 ? 'neg' : '') + '">' + fmt.mxn(monto) + '</td></tr>';
  }
  function filaFuerte(label, monto) {
    return '<tr class="strong"><td>' + label + '</td><td>' + fmt.mxn(monto) + '</td></tr>';
  }

  selDonde.addEventListener('change', function () { alCambiarDonde(); calcular(); });
  inTasa.addEventListener('input', function () {
    if (selDonde.value !== PERSONALIZADA) selDonde.value = PERSONALIZADA;
    detalleTasa.textContent = 'Escribe la tasa anual que te ofrecen.';
  });
  comparativo.addEventListener('click', function (e) {
    var b = e.target.closest('[data-opcion]');
    if (!b) return;
    selDonde.value = b.dataset.opcion;
    alCambiarDonde();
    calcular();
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.addEventListener('submit', calcular);
  form.addEventListener('input', function (e) { if (out.dataset.done && e.target !== selDonde) calcular(); });

  $('#rend-inflacion').value = fmt.num(T.inflacionEsperada, 1);
  alCambiarDonde();
  calcular(); /* con el ejemplo prellenado, para que se vea cómo funciona */
})();
