
var ua = $.browser;
if (ua.msie && ua.version<8 && window.location.pathname!='/ie') {
  window.location = '/ie';
}
