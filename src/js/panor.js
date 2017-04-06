;(function($) {

	var defaults = {
		showMenu: false
	}

	$.fn.panor = function(pages, options) {

		//create namespace to be used in plugin
		var panor = {},
		//reference to panor element
		el = $(this),
		mouseIsDown,
		pageX,
		pageY,
		pageLeft,
		pageTop,
		onAnimation = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

		if (el.data('panor')) { return; }

		//init settings for element
		var init = function() {
			if (el.data('panor')) { return; }
			//merge user-supplied options with the defaults
			panor.settings = $.extend({}, defaults, options);
			//set pages in the namespace
			panor.pages = pages;
			//set current page id
			panor.currentPage = 0;
			panor.currentLevel = {};
			panor.parentPage = false;
			panor.loadingPage = false;
			panor.animateCurrent = false;
			panor.animateNew = false;
			panor.loadingAnimationEl = $('<div class="panor-loading"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>');

			window.history.replaceState({pageLink: document.location.href}, document.title, document.location.href);	
			//runs setup
			setup();
		};

		//do all the DOM changes
		var setup = function() {
			//wrap the divs for propper styling 
			el.wrapInner('<div class="panor-page-content current"></div>');
			el.wrapInner('<div class="panor-page-inner"></div>');
			el.wrapInner('<div class="panor-page-full"></div>');
			el.wrapInner('<div class="panor-page"></div>');

			//store reference to page element
			panor.panorPage = el.find('.panor-page').first();
			panor.panorPageInner = el.find('.panor-page-inner').first();
			panor.currentPageEl = el.find('.current').first();

			//find current page
			findCurrentPage();

			//generate menu for the pages
			if (panor.settings.showMenu) {
				createMenu();
			}

			//set bindings
			bindEvents();

			//center the page
			centerPage();
		};

		//Generate menu for the pages
		var createMenu = function() {
			el.append('<div class="panor-menu"></div>');
			panor.panorMenu = el.find('.panor-menu').first();

			setMenuItems();
		};

		var setMenuItems = function () {
			var menu = '';
			
			if (panor.parentPage) {
				menu += '<div data-direction="parent" data-page="'+ panor.parentPage +'"></div>';
			}

			$.each(panor.currentLevel, function(current) {
				menu += '<div data-direction="next" data-page="'+ current +'">';

				if (!$.isEmptyObject(panor.currentLevel[current])) {
					menu += '<div data-direction="child" data-page="'+ Object.keys(panor.currentLevel[current])[0] +'"></div>';
				}
				menu += '</div>';
			});

			panor.panorMenu.html(menu);
		};

		//select the next page in the array
		var nextPage = function() {
			var level = Object.keys(panor.currentLevel);
			var newPage = level[$.inArray(level[($.inArray(panor.currentPage, level) +1) % level.length], level)];
			
			if (panor.currentPage === newPage) {
				resetPage();
				return false;
			}

			//set loadingPage to prevent form loading double
			panor.loadingPage = true;

			loadingAnimation('next');
			
			loadPage(newPage, 'next');
		}; 

		//select the previous page in the array
		var prevPage = function() {
			var level = Object.keys(panor.currentLevel);
			var newPage = level[$.inArray(level[($.inArray(panor.currentPage, level) - 1 + level.length) % level.length], level)];

			if (panor.currentPage === newPage) {
				resetPage();
				return false;
			}

			//set loadingPage to prevent form loading double
			panor.loadingPage = true;

			loadingAnimation('prev');
			
			loadPage(newPage, 'prev');
		};

		//Select the parent page (drag down)
		var parentPage = function() {
			if (panor.parentPage === false) {
				resetPage();
				return false;
			}

			//set loadingPage to prevent form loading double
			panor.loadingPage = true;

			loadingAnimation('parent');

			var result = findCurrentLevel(panor.pages, panor.parentPage, false);

			// # check result (later)
			panor.currentLevel = result.level;
			panor.parentPage = result.parent;

			loadPage(result.key, 'parent');
		};

		//Select the child page (drag up)
		var childPage = function() {
			// Check if page has no subpages
			if ($.isEmptyObject(panor.currentLevel[panor.currentPage])) {
				panor.loadingPage = false;
				mouseIsDown = false;
				centerPage(true);
				return false;
			}		

			//set loadingPage to prevent form loading double
			panor.loadingPage = true;

			loadingAnimation('child');

			var level = Object.keys(panor.currentLevel[panor.currentPage]);
			var result = findCurrentLevel(panor.pages, level[0], false);

			// # check result (later)
			panor.currentLevel = result.level;
			panor.parentPage = result.parent;

			loadPage(result.key, 'child');
		};

		var findAnyPage = function(url) {
			//set loadingPage to prevent form loading double
			panor.loadingPage = true;

			loadingAnimation('next');

			// # add check if page exists in object
			// # for now we know it is ok

			loadPage(url, 'next', true);	
		};

		var loadPage = function(newPage, direction, onHistoryChange) {
			//Check if onHistoryChange isset
			onHistoryChange = (typeof onHistoryChange === 'undefined') ? false : onHistoryChange;

			//load the content of new page
			$.post(newPage)
			.done(function(response) {
				loadingAnimation();
				var html = '<div class="panor-page-content">' + $(response).filter('.panor').html() + '</div>';
				html = $(html);

				var title = $(response).closest('title').text();

				//Setting new page
				setPage(newPage, direction, onHistoryChange, html, title);
			})
			.fail(function() {
				//enable loading a new page again
				panor.loadingPage = false;
				mouseIsDown = false;
				centerPage(true);

				//#Further error handling
				console.log('error');
			});
		};

		var setPage = function(newPage, direction, onHistoryChange, html, title) {
			var newPageEL = $(html),
			outClass = '',
			inClass = '';

			panor.panorPageInner.append(newPageEL.addClass('panor-new'));

			if (direction === 'next' || direction === 'prev') {
				if (direction === 'next') {
					outClass = 'pt-page-scaleDown';
					inClass = 'pt-page-moveFromRight pt-page-ontop';
				}
				else if (direction === 'prev') {
					outClass = 'pt-page-scaleDown';
					inClass = 'pt-page-moveFromLeft pt-page-ontop';
				}

				panor.panorPage.animate({ 
					scrollTop: panor.panorPage.offset().top + (panor.panorPage.height() / 4)
				}, {duration: 900, queue: false});
			}
			else if (direction === 'parent' || direction === 'child') {
				if (direction === 'parent') {
					outClass = 'pt-page-scaleDown';
					inClass = 'pt-page-moveFromTop pt-page-ontop';
				}
				else if (direction === 'child') {
					outClass = 'pt-page-scaleDown';
					inClass = 'pt-page-moveFromBottom pt-page-ontop';
				}

				panor.panorPage.animate({ 
					scrollLeft: panor.panorPage.offset().left + (panor.panorPage.width() / 4)
				}, {duration: 900, queue: false});
			}

			panor.currentPageEl.addClass(outClass).on(onAnimation, function() {
				panor.currentPageEl.off(onAnimation);
				panor.animateCurrent = true;
				if (panor.animateCurrent) {
					onEndAnimation(newPage, direction, onHistoryChange, newPageEL, title, inClass);
				}
			});

			newPageEL.addClass(inClass).on(onAnimation, function() {
				newPageEL.off(onAnimation);
				panor.animateNew = true;
				if (panor.animateNew) {
					onEndAnimation(newPage, direction, onHistoryChange, newPageEL, title, inClass);
				}
			});
		};

		//Align functions
		var centerPage = function(animate) {
			animate = (typeof animate === 'undefined') ? false : animate;

			if (animate){
				panor.panorPage.animate({ 
					scrollLeft: panor.panorPage.offset().left + (panor.panorPage.width() / 4), 
					scrollTop: panor.panorPage.offset().top + (panor.panorPage.height() / 4)
				}, {duration: 400, queue: false});
			}
			else {
				panor.panorPage.scrollLeft(panor.panorPage.offset().left + (panor.panorPage.width() / 4));
				panor.panorPage.scrollTop(panor.panorPage.offset().top + (panor.panorPage.height() / 4));
			}
		};

		var findCurrentPage = function() {
			var currentURL = window.location.href;

			var result = findCurrentLevel(panor.pages, currentURL, false);

			panor.currentPage = result.key;
			panor.currentLevel = result.level;
			panor.parentPage = result.parent;

			console.log(currentURL);
			console.log(panor.pages);

			if (typeof result !== 'object') {
				// # furhter error handling
				console.log('error');
			}
		}

		var findCurrentLevel = function(level, key, parent) {
		    var found = false;
		    for (var i in level) {
		        if (!level.hasOwnProperty(i)) continue;
				if (i == key) {
					return {level: level, key: key, parent: parent};
		        }
		        else if (typeof level[i] == 'object' && !$.isEmptyObject(level[i])) {
		        	var result = findCurrentLevel(level[i], key, i);
		        	if(typeof result === 'object') {
		        		found = result;
		        		break;
		        	}
		        }
		    }
		    return found;
		}

		var onEndAnimation = function(newPage, direction, onHistoryChange, newPageEL, title, inClass) {
			centerPage();
			panor.animateCurrent = false;
			panor.animateNew = false;

			//remove new classes
			panor.currentPageEl.remove();
			newPageEL.removeClass(inClass + ' panor-new').addClass('current');

			//push to history
			if (!onHistoryChange) {	
				window.history.pushState({pageLink: newPage}, title, newPage);
			}
			document.title = title;

			//set newpage ot current
			panor.currentPageEl = newPageEL;
			panor.currentPage = newPage;

			panor.loadingPage = false;
			mouseIsDown = false;

			if (panor.settings.showMenu && (direction === 'child' || direction === 'parent')) {
				setMenuItems();
			}
		}

		var loadingAnimation = function(direction) {
			if (panor.panorPageInner.find(panor.loadingAnimationEl).length) {
				panor.loadingAnimationEl.fadeOut(300, function() {
					$(this).remove();
					panor.loadingAnimationEl.removeClass('panor-loading-next panor-loading-prev panor-loading-parent panor-loading-child');
				});

			} else {
				panor.loadingAnimationEl.addClass('panor-loading-' + direction).hide().appendTo(panor.panorPageInner).fadeIn(300);
			}
		}

		var resetPage = function() {
			panor.loadingPage = false;
			mouseIsDown = false;
			centerPage(true);
		}

		//bind functions
		var bindEvents = function() {
			// window bindings
			$(window).bind('resize', resizeWindow);
			window.addEventListener('popstate', onWindowLocChange);

			//.panor-page bindings
			panor.panorPage.bind('mousedown', 'event', mouseDown);
			panor.panorPage.bind('mousemove', 'event', mouseMove);
			panor.panorPage.bind('mouseup', 'event', mouseUp);

			if (panor.settings.showMenu) {
				panor.panorMenu.bind('click', 'event', loadMenuItem);
			}		
		}

		var resizeWindow = function() {
			if (!panor.loadingPage) {
				centerPage();
			}
		};

		var onWindowLocChange = function(event) {
			// # detection for back or foward needed
			// # solution: save the last visted page
			// # check with array next and prev 
			// # which animation needs to be loaded
			panor.panorPage.animate({ scrollLeft: panor.panorPage.width()}, 400, function() {
				findAnyPage(event.state.pageLink);
			});
		}

		var mouseDown = function(e) {
			e.preventDefault();
			mouseIsDown = true;
			pageX = e.pageX;
			pageY = e.pageY;
			pageLeft = panor.panorPage.scrollLeft();
			pageTop = panor.panorPage.scrollTop();
		};

		var mouseMove = function(e) {
			if(mouseIsDown && !panor.loadingPage){
				if (panor.panorPage.scrollLeft() <= 20) {
					panor.loadingPage = true;
					prevPage();
				} 
				else if ((panor.panorPage.scrollLeft() - panor.panorPage.width() / 2) >= -20){
					panor.loadingPage = true;
					nextPage();
				}
				else if (panor.panorPage.scrollTop() <= 20) {
					panor.loadingPage = true;
					parentPage();
				}
				else if ((panor.panorPage.scrollTop() - panor.panorPage.height() / 2) >= -20) {
					panor.loadingPage = true;
					childPage();
				}
				else {
					panor.loadingPage = false;
				}
				panor.panorPage.scrollLeft(pageLeft - e.pageX + pageX);  
				panor.panorPage.scrollTop(pageTop - e.pageY + pageY);    
			}		
		};

		var mouseUp = function(e) {
			mouseIsDown = false;
			if (!panor.loadingPage) {
				centerPage(true);
			}
		};

		var loadMenuItem = function(e) {
			if (e.target.getAttribute('data-page') && e.target.getAttribute('data-page') != panor.currentPage) {
				panor.panorPage.animate({ scrollLeft: panor.panorPage.width()}, 400, function() {
					panor.loadingPage = true;

					var direction = e.target.getAttribute('data-direction') || 'next';

					if (direction === 'parent' || direction === 'child') {
						var result = findCurrentLevel(panor.pages, e.target.getAttribute('data-page'), false);

						panor.currentLevel = result.level;
						panor.parentPage = result.parent;
					}

					loadingAnimation(direction);
					loadPage(e.target.getAttribute('data-page'), direction);
				});
			}
		};

		init();   

		el.data('panor', this);

		// returns the current jQuery object
		return this;

	};

})(jQuery);