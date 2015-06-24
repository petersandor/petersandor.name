;(function($) {
  // Settings for Disqus
  window.disqus_shortname = 'petersandor';

  //Cached stuff
  $body = $('body');

  // Touch delay fix
  FastClick.attach($body[0]);

  // All the fancy stuff
  (function decorate() {
    NProgress.start();

    // ------------------------------
    // SEARCH
    $('.search-link').click(function() {
      $(this).toggleClass('active');
      $('.header-search').slideToggle();
    });
    // ------------------------------

    // ------------------------------
    /* TOOLTIPS */
    $('.tooltip').each(function(index, element) {
      $(this).tooltipster({
        position: $(this).data('tooltip-pos'),
        fixedWidth: 300,
        offsetX: 8,
        animation: "grow",
        delay: 50
      });
    });
    // ------------------------------

    // ------------------------------
    // LIGHTBOX
    $('.lightbox').each(function(index, element) {
      $this = $(this);

      $this.attr('rel', $this.data('lightbox-gallery'));
    });

    if ($("a[rel^='fancybox']").length) {
      $("a[rel^='fancybox']").fancybox({
        centerOnScroll: true,
        padding: 10,
        margin: 44,
        width: 640,
        height: 360,
        transitionOut: 'none',
        overlayColor: '#BEBD97',
        overlayOpacity: '.6',
        onStart: function() {
          NProgress.start();
          $body.addClass('lightbox-active');
        },
        onClosed: function() {
          $body.removeClass('lightbox-active');
        },
        onComplete: function() {
          NProgress.done();
          if ($(this).attr('href').indexOf("soundcloud.com") >= 0) {
            $('#fancybox-content').height(166);
          }
        }
      });
    }
    // ------------------------------



    // ------------------------------
    // CODE PRETTIFY
    if ($('.prettyprint').length) {
      window.prettyPrint && prettyPrint();
    }
    // ------------------------------

    // ------------------------------
    // TABS
    $('.tabs').each(function() {
      var thisTab = $(this),
        activeLinks = thisTab.find('.tab-titles li a.active');

      if (!activeLinks.length) {
        thisTab.find('.tab-titles li:first-child a').addClass('active');
        thisTab.find('.tab-content > div:first-child').show();
      } else {
        thisTab.find('.tab-content > div').eq(activeLinks.parent().index()).show();
      }
    });

    $('.tabs .tab-titles li a').click(function() {
      var thisTitle = $(this);

      if (thisTitle.hasClass('active')) {
        return;
      }

      thisTitle.parent().siblings().find('a').removeClass('active');
      thisTitle.addClass('active');
      thisTitle.parents('.tabs').find('.tab-content > div').hide().eq($(this).parent().index()).show();
      return false;
    });
    // ------------------------------

    // ------------------------------
    // TOGGLES
    var toggleSpeed = 300;
    $('.toggle h4.active + .toggle-content').show();

    $('.toggle h4').click(function() {
      var thisH4 = $(this),
        thisH4Toggle = thisH4.next('.toggle-content'),
        siblingToggles = thisH4.parent().siblings();

      if (thisH4.hasClass('active')) {
        thisH4.removeClass('active');
        thisH4Toggle.stop(true, true).slideUp(toggleSpeed);
      } else {

        thisH4.addClass('active');
        thisH4Toggle.stop(true, true).slideDown(toggleSpeed);

        //accordion
        if (thisH4.parents('.toggle-group').hasClass('accordion')) {
          allToggles.find('h4').removeClass('active');
          allToggles.find('.toggle-content').stop(true, true).slideUp(toggleSpeed);
        }

      }
      return false;
    });
    // ------------------------------

    // ------------------------------
    // RESPONSIVE VIDEOS
    var responsiveVids = $('.media-wrap, .portfolio-single');
    if (responsiveVids.length) {
      responsiveVids.fitVids();
    }
    // ------------------------------

    // ------------------------------
    var ua = navigator.userAgent.toLowerCase(),
      isAndroid = ua.indexOf("android") > -1;
    if (isAndroid) {
      $('html').addClass('android');
    }
    // ------------------------------



    // ------------------------------
    /* FLEX SLIDER */
    // cache container
    var $flexslider = $('.flexslider');
    if ($flexslider.length) {

      $flexslider.each(function() {
        flexInstance = $(this);

          //remove loading
        flexInstance.find('.loading').remove();

          //setup slider
        flexInstance.flexslider({
            smoothHeight: true,
          slideshow: flexInstance.data('autoplay') != "false",
          slideshowSpeed: flexInstance.data('interval'),
          animationSpeed: flexInstance.data('animationSpeed'),
          animation: flexInstance.data('animation'),
          direction: flexInstance.data('direction'),
          directionNav: flexInstance.data('directionNav') != "false",
          controlNav: flexInstance.data('controlNav') != "false",
          randomize: flexInstance.data('randomize') == "true",
          startAt: flexInstance.data('startAt') !== null ? parseInt(flexInstance.data('startAt')) : 0,
          animationLoop: flexInstance.data('animationLoop') != "false",
          pauseOnHover: flexInstance.data('pauseOnHover') != "false",
          reverse: flexInstance.data('reverse') == "true",
            prevText: '',
            nextText: '',
            start: function(slider) {
              $('.slides li img').click(function(event) {
                event.preventDefault();
                slider.flexAnimate(slider.getTarget("next"));
              });
            }
          });

        });
    }
    // ------------------------------
  })();

  // Helper function to create script tags
  function createScriptTag( src, async ) {
    var s = document.createElement('script');

    s.async = true;
    s.type = 'text/javascript';
    s.src = src;

    return s;
  }

  // Disquss stuff yo
  (function() {
    var dCountSrc = '//' + disqus_shortname + '.disqus.com/count.js',
      dEmbedSrc = '//' + disqus_shortname + '.disqus.com/embed.js',
      scriptTags = [],
      disqusDivExists = $('#disqus_thread').length === 1 ? true : false;

    if(disqusDivExists) {
      scriptTags.push( createScriptTag(dCountSrc, true) );
      scriptTags.push( createScriptTag(dEmbedSrc, true) );
    }

    $body.append( scriptTags );
  }());

  window.onload = function() {
    NProgress.done();
  };
})(window.jQuery);