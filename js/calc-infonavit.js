/* =========================================================================
   CalculaMX · Simulador de crédito Infonavit
   Requiere: tax-data.js, site.js
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var fmt = window.CalculaMX;

  var form = $('#info-form');
  if (!form) return;
  var out = $('#info-result');
  var tabla = $('#info-tabla');

  function pagoFijo(monto, i, n) {
    return i === 0 ? monto / n : monto * i / (1 - Math.pow(1 + i, -n));
  }

  /* Amortiza con un abono extra mensual a capital (aportación patronal).
     El pago base se mantiene fijo; el abono extra acorta el plazo en vez
     de reducir la mensualidad. */
  function amortizar(monto, tasaAnual, plazoMeses, abonoExtra) {
    var i = tasaAnual / 12;
    var pagoBase = pagoFijo(monto, i, plazoMeses);
    var saldo = monto, mes = 0, totalInteres = 0, totalPagado = 0;
    var filas = [];
    var topeMeses = plazoMeses * 3; /* salvaguarda */
    while (saldo > 0.5 && mes < topeMeses) {
      mes++;
      var interes = saldo * i;
      var capital = pagoBase - interes + abonoExtra;
      if (capital > saldo) capital = saldo;
      var cuota = capital + interes;
      saldo = Math.max(0, saldo - capital);
      totalInteres += interes;
      totalPagado += cuota;
      filas.push({ mes: mes, cuota: cuota, capital: capital, interes: interes, saldo: saldo });
    }
    return { pagoBase: pagoBase, meses: mes, totalInteres: totalInteres, totalPagado: totalPagado, filas: filas };
  }

  function calcular(e) {
    if (e) e.preventDefault();

    var monto = fmt.parse($('#info-monto').value);
    var tasaAnual = fmt.parse($('#info-tasa').value) / 100;
    var plazoAnios = fmt.parse($('#info-plazo').value);
    var sueldo = fmt.parse($('#info-sueldo').value);
    var conAportacion = $('#info-aportacion').checked;

    if (!(monto > 0) || !(plazoAnios > 0) || !(tasaAnual >= 0)) {
      out.innerHTML = '<p class="result-empty">Ingresa monto, tasa y plazo para calcular.</p>';
      tabla.innerHTML = '';
      return;
    }

    var plazoMeses = Math.round(plazoAnios * 12);
    var abonoExtra = (conAportacion && sueldo > 0) ? sueldo * 0.05 : 0;

    var sinAportacion = amortizar(monto, tasaAnual, plazoMeses, 0);
    var resultado = conAportacion ? amortizar(monto, tasaAnual, plazoMeses, abonoExtra) : sinAportacion;

    var rows = '';
    rows += fila('Monto del crédito', monto);
    rows += fila('Pago mensual', resultado.pagoBase);
    if (sueldo > 0) rows += filaTexto('% de tu sueldo mensual', fmt.pct((resultado.pagoBase / sueldo) * 100));
    rows += fila('Total de intereses', resultado.totalInteres);
    rows += filaFuerte('Total a pagar', resultado.totalPagado);
    if (conAportacion && abonoExtra > 0) {
      var mesesAhorrados = sinAportacion.meses - resultado.meses;
      var interesAhorrado = sinAportacion.totalInteres - resultado.totalInteres;
      rows += fila('Aportación patronal aplicada a capital (5% de tu sueldo)', abonoExtra);
      rows += filaTexto('Meses que adelantas tu crédito', mesesAhorrados + ' meses (' + fmt.num(mesesAhorrados / 12, 1) + ' años)');
      rows += fila('Intereses que te ahorras', interesAhorrado, 'pos');
    }

    out.innerHTML =
      '<p class="result-caption">RESULTADO ESTIMADO</p>' +
      '<p class="result-main">' + fmt.mxn(resultado.pagoBase) + '<span> / mes</span></p>' +
      '<p class="result-sub">' + resultado.meses + ' meses para liquidar' + (abonoExtra > 0 ? ' (con aportación patronal)' : '') + '</p>' +
      '<table class="breakdown"><tbody>' + rows + '</tbody></table>' +
      '<p class="result-note">La aportación patronal (5% de tu salario, que tu empleador deposita en tu subcuenta de vivienda) se aplica aquí como abono a capital, ' +
      'que es como realmente opera: acorta el plazo en vez de bajar la mensualidad. El monto y la tasa reales de tu crédito los define Infonavit según tu edad, ' +
      'salario y saldo de tu subcuenta — usa esta calculadora con los datos de tu Mi Cuenta Infonavit. Estimación educativa.</p>';

    var filas = resultado.filas.map(function (f) {
      return '<tr><td>' + f.mes + '</td><td>' + fmt.num(f.cuota) + '</td><td>' +
        fmt.num(f.capital) + '</td><td>' + fmt.num(f.interes) + '</td><td>' + fmt.num(f.saldo) + '</td></tr>';
    }).join('');
    tabla.innerHTML =
      '<h2>Tabla de amortización</h2>' +
      '<div class="table-scroll"><table class="amort"><thead><tr><th>Mes</th><th>Pago</th>' +
      '<th>Capital</th><th>Interés</th><th>Saldo</th></tr></thead><tbody>' + filas + '</tbody></table></div>';

    fmt.track('calculo_infonavit', { con_aportacion: conAportacion });
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
