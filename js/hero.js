/* CalculaMX · mini calculadora del hero (ISR mensual rápido) */
(function () {
  'use strict';
  var D = window.DATOS_FISCALES, F = window.FISCAL, fmt = window.CalculaMX;
  var input = document.querySelector('#hero-income');
  if (!input) return;
  var nEl = document.querySelector('#hero-net');
  var lEl = document.querySelector('#hero-detail');

  function run() {
    var bruto = fmt.parse(input.value);
    if (!(bruto > 0)) {
      nEl.textContent = '—';
      lEl.textContent = 'Escribe tu salario mensual bruto';
      return;
    }
    var isr = Math.max(0, F.isr(bruto, D.tarifaMensual) - F.subsidio(bruto, 'mensual'));
    nEl.textContent = fmt.mxn(bruto - isr);
    lEl.textContent = 'Neto aprox. · ISR retenido ' + fmt.mxn(isr) + ' (sin IMSS)';
  }
  input.addEventListener('input', run);
  run();
})();
