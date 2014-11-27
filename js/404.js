;(function($) {
  var $toolTips = $('.tooltip'),
    $body = $('body');

  FastClick.attach($body[0]);

  $toolTips.each(function(index, element) {
    var $this = $(this);

    $this.tooltipster({
      position: $this.data('tooltip-pos'),
      fixedWidth: 300,
      offsetX: 8,
      animation: "grow",
      delay: 50
    });
  });


})(window.jQuery);