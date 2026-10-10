// Reveal on scroll
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function (el) { io.observe(el); });
})();

// Clics a WhatsApp (boton flotante, pie de pagina y llamado al final de cada
// articulo). Igual que site.js de vonoaweb.com: evento de GA4 "whatsapp_click"
// con source "blog" y la conversion de Google Ads "Contacto WhatsApp", para
// que los clientes que llegan por un articulo cuenten en los reportes y en Ads.
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp"], a[href*="whatsapp.com/send"]');
    if (!a) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'whatsapp_click', source: 'blog' });
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', { source: 'blog', page_path: location.pathname });
      gtag('event', 'conversion', { send_to: 'AW-10804436682/0icSCKGEqtUcEMq9-p8o' });
    }
    if (typeof fbq === 'function') fbq('track', 'Contact');
  }, true);
})();
