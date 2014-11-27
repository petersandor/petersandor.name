;(function( $, undefined ) {

	var PS = PS || {};

	PS.$window = $(window);
	PS.$html = $('html');
	PS.$body = $('body');
	PS.classicLayout = false;

	// Main initialization function
	PS.init = function() {
		// start loader
		PS.modules.loader.start();

		// remove click delay on touch devices
		FastClick.attach(PS.$body[0]);

		// ONE PAGE LAYOUT FUNCTIONS
		if (PS.$html.hasClass('one-page-layout')) {
			// ------------------------------
			// LAYOUT DETECT
			var pagesCount = $('.wrapper > section').length,
				isIE11 = !!navigator.userAgent.match(/Trident\/7\./);

			PS.classicLayout = PS.$html.data('classic-layout') === true;
			PS.classicLayout = PS.classicLayout || (PS.$html.data('mobile-only-classic-layout') === true && PS.$window.width() < 768);
			PS.classicLayout = PS.classicLayout || !Modernizr.csstransforms3d || pagesCount < 3;

			if (PS.classicLayout) {
				PS.$html.addClass('classic-layout');
			} else {
				// initialize triple layout
				$.initTripleLayout();
			}

			$.address.change( PS.handleAddressChange );
		}

		PS.util.plugins.init();
		// Init back navigation support for portfolio views
		PS.util.backNavSupport();
		PS.util.validate();

		PS.$window[0].onload = function() {
			PS.modules.loader.stop();

			PS.modules.isotope.init();
			PS.$window.on('debouncedresize', PS.modules.isotope.init);
		};
	};

	// Main page calls handler
	PS.handleAddressChange = function() {

		if(PS.classicLayout) {
			PS.util.setActivePage();
		}

		var cPath = $.address.path().slice(1);

		cPath = cPath === '' || cPath === undefined ? 'about' : cPath;

		return ( PS.page.visited.hasOwnProperty(cPath) ) ? ( PS.page.visited[ cPath ] ? true : PS.page[ cPath ]() ) : true;
	};

	// Utility functions
	PS.util = {};

	PS.util.giveDetailUrl = function() {
		var address = $.address.value(),
			portfolioKeyword = 'portfolio',
			detailUrl, total;

		if (address.indexOf("/" + portfolioKeyword + "/") != -1 && address.length > portfolioKeyword.length + 2) {
			total = address.length;
			detailUrl = address.slice(portfolioKeyword.length + 2, total);
		} else {
			detailUrl = -1;
		}
		return detailUrl;
	};

	PS.util.project = {
		config : {
			pActive : '',
			inAnimation : PS.$html.data('in-animation'),
			outAnimation : PS.$html.data('out-animation')
		},

		show : function(url) {
			PS.modules.loader.start();

			var p = $('.p-overlay:not(.active)').first();
			PS.util.project.config.pActive = $('.p-overlay.active');

			if (PS.util.project.config.pActive.length) {
				PS.util.project.hide();
			}

			// ajax : fill data
			p.empty().load(url + ' .portfolio-single', function() {
				NProgress.set(0.5);

				// wait for images to be loaded
				p.imagesLoaded(function() {

					PS.modules.loader.stop();

					PS.$html.addClass('p-overlay-on');
					PS.$body.scrollTop(0);

					// setup plugins
					// setup();

					if (Modernizr.csstransforms && Modernizr.csstransforms3d) { // modern browser
						p.removeClass('animated ' + PS.util.project.config.outAnimation + " " + PS.util.project.config.inAnimation).addClass('animated ' + PS.util.project.config.inAnimation).show();
					} else { //old browser
						p.fadeIn();
					}
					p.addClass('active');

				});
			});
		},

		hide : function(forever, safeClose) {
			// param forever : close the detail window forever. no navigating through the windows.
			// param safeClose : true if it is triggered by menu change = not a real close.
			PS.$html.removeClass('p-overlay-on');

			// close completely by back link.
			if (forever) {
				PS.util.project.config.pActive = $('.p-overlay.active');

				if (!safeClose) {
					// remove detail url
					$.address.path('portfolio');
					PS.$body.scrollTop(0);
				}
			}

			PS.util.project.config.pActive.removeClass('active');

			if (Modernizr.csstransforms && Modernizr.csstransforms3d) { // modern browser
				PS.util.project.config.pActive.removeClass('animated ' + PS.util.project.config.inAnimation).addClass('animated ' + PS.util.project.config.outAnimation);

				setTimeout(function() {
					PS.util.project.config.pActive.hide().removeClass(PS.util.project.config.outAnimation).empty();
				}, 1010);
			} else {
				//old browser
				PS.util.project.config.pActive.fadeOut().empty();
			}
		}
	};

	PS.util.setCurrentMenuItem = function() {
		var activePageId = $('.page.active').attr('id');

		// set default nav menu
		$('.vs-nav a[href$=' + activePageId + ']').parent().addClass('current_page_item').siblings().removeClass('current_page_item');
	};

	PS.util.backNavSupport = function() {
		// FULL BROWSER BACK BUTTON SUPPORT
		var prevUrl = -1;

		$.address.change(function() {
			var detailUrl = PS.util.giveDetailUrl();

			if (detailUrl != -1) {
				PS.util.project.show(detailUrl);
			} else {
				if ($.address.path().indexOf("/portfolio") != -1) {
					if (prevUrl != -1) {
						PS.util.project.hide(true, false);
					} else {
						PS.util.project.hide(true, true);
					}
				}
			}
			prevUrl = PS.util.giveDetailUrl();
		});
	};

	PS.util.setActivePage = function() {
		var pages = $('.page'),
			path = $.address.path(),
			firstPage, nextPage;

		pages.removeClass('active').hide();

		path = path.slice(1, path.length);
		path = PS.util.giveDetailUrl() !== -1 ? 'portfolio' : path;

		if (path === '') { // if hash tag doesnt exists - go to first page
			firstPage = $('.vs-nav li').first().find('a').attr('href');

			path = firstPage.slice(2, firstPage.length);
			$.address.path(path);

			return false;
		}

		nextPage = pages.filter('#' + path);

		if(!nextPage.length) {
			nextPage = pages.eq(0);
			// $.address.value(nextPage.attr('id'));
		}

		// show page
		nextPage.fadeIn().addClass('active');

		PS.util.setCurrentMenuItem();

		PS.$body.scrollTop(0);
	};

	PS.util.validate = function() {
		var commentForm = $('#commentform'),
			formToValidate = $('.validate-form');

		commentForm.addClass('validate-form');

		commentForm.find('input, textarea').each(function(index, element) {
			$this = $(this);

			if ($this.attr('aria-required') === "true") {
				$this.addClass('required');
			}
			if ($this.attr('name') === "email") {
				$this.addClass('email');
			}
		});

		// validate form
		if (formToValidate.length) {
			formToValidate.validate();
		}
	};

	PS.util.skillBars = function() {
		var bars = $('.bar');

		bars.each(function() {
			var bar = $(this);

			bar.find('.progress').css('width', bar.data('percent') + '%');
		});
	};

	// Plugins
	PS.util.plugins = {};

	PS.util.plugins.lightBox = function() {
		var lightBoxes = $('.lightbox'),
			lightBoxLink = $("a[rel^='fancybox']");

		lightBoxes.each(function(index, element) {
			var $this = $(this);

			$this.attr('rel', $this.data('lightbox-gallery'));
		});

		if (lightBoxLink.length) {
			lightBoxLink.fancybox({
				centerOnScroll: true,
				padding: 10,
				margin: 44,
				width: 640,
				height: 360,
				transitionOut: 'none',
				overlayColor: '#BEBD97',
				overlayOpacity: '.6',
				onStart: function() {
					PS.modules.loader.start();
					PS.$body.addClass('lightbox-active');
				},
				onClosed: function() {
					PS.$body.removeClass('lightbox-active');
				},
				onComplete: function() {
					PS.modules.loader.stop();

					if ($(this).attr('href').indexOf('soundcloud.com') >= 0) {
						$('#fancybox-content').height(166);
					}
				}
			});
		}
	};

	PS.util.plugins.uniform = function() {
		$("select:not([multiple]), input:checkbox, input:radio, input:file").uniform();

		var ua = navigator.userAgent.toLowerCase(),
			isAndroid = ua.indexOf("android") > -1;

		if (isAndroid) {
			PS.$html.addClass('android');
		}
	};

	PS.util.plugins.init = function() {
		PS.util.plugins.lightBox();
		PS.util.plugins.uniform();
	};

	// Page specific functionality
	PS.page = {};

	PS.page.about = function () {
		// Rotating words
		PS.modules.rotatingWords();

		// Latest tweets widget
		PS.modules.twitterWidget.init();

		PS.page.visited.about = true;
	};

	PS.page.portfolio = function() {
		// Lay out grid
		var portfolioGrid = $('.portfolio-items');
		PS.modules.isotope.recalculate( portfolioGrid );

		// Set up listeners for portfolio items
		$(document).on('click', '.one-page-layout a.ajax', function() {

			var url = $(this).attr('href'),
				baseUrl = $.address.baseURL(),
				detailUrl = PS.util.giveDetailUrl(),
				returnVal, total;

			if (url.indexOf(baseUrl) !== -1) {
				// full url
				total = url.length;
				detailUrl = url.slice(baseUrl.length + 1, total);
			} else {
				// relative url
				detailUrl = url;
			}

			$.address.path('portfolio/' + detailUrl);

			return false;
		});

		PS.page.visited.portfolio = true;
	};

	PS.page.contact = function() {
		setTimeout(function() {
			PS.modules.contactForm();
		} , 700);

		PS.page.visited.contact = true;
	};

	PS.page.blog = function() {
		// Lay out grid
		var blogGrid = $('.latest-posts');
		PS.modules.isotope.recalculate( blogGrid );

		PS.page.visited.blog = true;
	};

	PS.page.resume = function() {
		// Fill skill bars
		PS.util.skillBars();

		PS.page.visited.resume = true;
	};

	PS.page.visited = {
		about : false,
		portfolio : false,
		contact : false,
		blog : false,
		resume : false
	};

	PS.modules = {};

	// Twitter module
	PS.modules.twitterWidget = {
		init : function() {
			var latest_tweets = $('#latest-tweets'),
				handleTweets = function(tweets) {
					var x = tweets.length,
						n = 0,
						html = '<ul>';

					while (n < x) {
						html += '<li>' + tweets[n] + '</li>';
						n++;
					}

					html += '</ul>';
					latest_tweets.html(html);
				},
				config = {
					'id': latest_tweets.data("twitter-id"),
					'domId': '',
					'maxTweets': latest_tweets.data("tweet-count"),
					'enableLinks': true,
					'showUser': false,
					'showTime': true,
					'dateFunction': '',
					'showRetweet': latest_tweets.data("include-retweets"),
					'customCallback': handleTweets,
					'showInteraction': false
				};

			if (latest_tweets.length) {
				twitterFetcher.fetch(config);
			}
		}
	};

	// Rotating Words
	PS.modules.rotatingWords = function() {
		var rotatingWords = $('.rotate-words'),
			nextWordIndex, rotateInterval;

		if (rotatingWords.length) {
			if (Modernizr.csstransforms) {
				rotatingWords.each(function(index, element) {
					var $element = $(element);

					$element.find('span').eq(0).addClass('active');

					rotateInterval = setInterval(function() {
						nextWordIndex = $element.find('.active').next().length ? $element.find('.active').next().index() : 0;
						$element.find('.active').addClass('rotate-out').removeClass('rotate-in active');
						$element.find('span').eq(nextWordIndex).addClass('rotate-in active').removeClass('rotate-out');
					}, 3000);
				});
			} else {
				rotatingWords.each(function(index, element) {
					var $element = $(element);

					$element.find('span').eq(0).addClass('active').show();

					rotateInterval = setInterval(function() {
						nextWordIndex = $element.find('.active').next().length ? $element.find('.active').next().index() : 0;
						$element.find('.active').removeClass('active').slideUp(500);
						$element.find('span').eq(nextWordIndex).addClass('active').slideDown(500);
					}, 3000);
				});
			}
		}
	};

	// PS.modules.map = {
	// 	init : function() {
	// 		if (google.maps !== undefined && $('.map').length) {
	// 			var mapCanvas = $('#map-canvas'),
	// 				mapStyles = [{
	// 					"featureType": "water",
	// 					"stylers": [{
	// 						"color": "#79CE98"
	// 					}, {
	// 						"visibility": "on"
	// 					}]
	// 				}, {
	// 					"featureType": "landscape",
	// 					"stylers": [{
	// 						"color": "#ffffff"
	// 					}]
	// 				}, {
	// 					"featureType": "road",
	// 					"stylers": [{
	// 						"saturation": -100
	// 					}, {
	// 						"lightness": 45
	// 					}]
	// 				}, {
	// 					"featureType": "road.highway",
	// 					"stylers": [{
	// 						"visibility": "simplified"
	// 					}]
	// 				}, {
	// 					"featureType": "road.arterial",
	// 					"elementType": "labels.icon",
	// 					"stylers": [{
	// 						"visibility": "off"
	// 					}]
	// 				}, {
	// 					"featureType": "administrative",
	// 					"elementType": "labels.text.fill",
	// 					"stylers": [{
	// 						"color": "#6A7686"
	// 					}]
	// 				}, {
	// 					"featureType": "transit",
	// 					"stylers": [{
	// 						"visibility": "off"
	// 					}]
	// 				}, {
	// 					"featureType": "poi",
	// 					"stylers": [{
	// 						"visibility": "off"
	// 					}]
	// 				}],
	// 				mapMarkerImg = 'images/ico/map-marker.png',
	// 				myLatlng = new google.maps.LatLng(mapCanvas.data("latitude"), mapCanvas.data("longitude")),
	// 				mapOptions = {
	// 					zoom: mapCanvas.data("zoom"),
	// 					center: myLatlng,
	// 					styles: mapStyles,
	// 					disableDefaultUI: true
	// 				},
	// 				map = new google.maps.Map(mapCanvas[0], mapOptions),
	// 				marker = new google.maps.Marker({
	// 					position: myLatlng,
	// 					map: map,
	// 					icon: mapMarkerImg
	// 				});
	// 		}
	// 	}
	// };

	PS.modules.isotope = {
		init : function() {
			var $containers = $('.media-grid');

			// set up filters in case they are there
			$containers.each(function() {
				var $this = $(this),
					$thisFilters = $this.siblings().filter('.filters'),
					$thisHasFilters = $thisFilters.length ? true : false;

				if($thisHasFilters) {
					$thisFilters.find('a').click(function() {
						var filterBtn = $(this),
							filterSelector = filterBtn.data('filter');

						$this.isotope({
							filter: filterSelector
						});

						filterBtn.parent().addClass('current').siblings().removeClass('current');

						PS.modules.isotope.recalculate( $this );
						return false;
					});
				}

				PS.modules.isotope.recalculate( $this );
			});
		},

		recalculate : function ($container) {
			var w = $container.width(),
				columnNum = 1,
				columnWidth = 0;

			if (w > 1300) {
				columnNum	= 4;
			} else if (w > 900) {
				columnNum	= 3;
			} else if (w > 480) {
				columnNum	= 2;
			} else if (w > 0) {
				columnNum	= 1;
			}

			columnWidth = Math.floor(w / columnNum);

			$container.find('.hentry').each(function() {
				var $item = $(this),
					multiplier = $item.hasClass('x2') && columnNum > 1 ? 2 : 1,
					itemWidth = (columnWidth * 100 / w) * multiplier;

				$item.css({
					width : itemWidth + '%'
				});
			});

			$container.isotope({
				itemSelector: '.hentry',
				masonry: {
				 columnWidth: columnWidth
				}
			});
		}
	};

	PS.modules.loader = {
		start : function() {
			NProgress.start();
		},

		stop : function() {
			NProgress.done();
		}
	};

	PS.modules.contactForm = function() {
		var contactForm = $('#contact-form'),
			contactFormAction = contactForm.attr('action'),
			$alert = $('.site-alert');

		contactForm.submit(function(event) {
			var self = $(this),
				formValues = '';

			// Stop the browser from submitting the form.
			event.preventDefault();

			if (contactForm.valid()) {
				// Start progress bar
				NProgress.start();

				formValues = self.serialize();

				$.post( contactFormAction, formValues).done( function( response ) {
					if (response === 'success') {
						contactForm.clearForm();
					}
				}).fail( function( response ) {

					$alert.addClass('error');
				}).always( function() {
					NProgress.done();

					$alert.removeClass('slideOutRight')
						.show()
						.addClass('slideInLeft');

					setTimeout(function() {
						$alert.removeClass('slideInLeft')
						.addClass('slideOutRight');
					}, 2000);
				});
			}

			return false;
		});

		$.fn.clearForm = function() { 
			return this.each(function() {  
				var self = this,
					type = self.type,
					tag = self.tagName.toLowerCase();  

				if (tag == 'form') {
					return $(':input', self).clearForm();  
				}

				if (type == 'text' || type == 'password' || tag == 'textarea') {
					self.value = '';
				} else if (type == 'checkbox' || type == 'radio') {
					self.checked = false;
				} else if (tag == 'select') {
					self.selectedIndex = -1;
				}
			});
		};
	};

	PS.init();

})( window.jQuery );