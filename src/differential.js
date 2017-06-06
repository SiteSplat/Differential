/*!
 *
 * Differential
 *
 * Copyright (c) 2017 Karl Saunders (http://mobiuswebdesign.co.uk)
 * Licensed under MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * Version: 0.0.1
 *
 */


// Cross-browser mousewheel listener: https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
(function(window,document) {

  var prefix = "", _addEventListener, support;

  // detect event model
  if ( window.addEventListener ) {
    _addEventListener = "addEventListener";
  } else {
    _addEventListener = "attachEvent";
    prefix = "on";
  }

  // detect available wheel event
  support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
  document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
  "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

  window.addWheelListener = function( elem, callback, useCapture ) {
    _addWheelListener( elem, support, callback, useCapture );

    // handle MozMousePixelScroll in older Firefox
    if( support == "DOMMouseScroll" ) {
      _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
    }
  };

  function _addWheelListener( elem, eventName, callback, useCapture ) {
    elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
      !originalEvent && ( originalEvent = window.event );

      // create a normalized event object
      var event = {
        // keep a ref to the original event object
        originalEvent: originalEvent,
        target: originalEvent.target || originalEvent.srcElement,
        type: "wheel",
        deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0,
        preventDefault: function() {
          originalEvent.preventDefault ?
            originalEvent.preventDefault() :
          originalEvent.returnValue = false;
        }
      };

      // calculate deltaY (and deltaX) according to the event
      if ( support == "mousewheel" ) {
        event.deltaY = - 1/40 * originalEvent.wheelDelta;
        // Webkit also support wheelDeltaX
        originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
      } else {
        event.deltaY = originalEvent.deltaY || originalEvent.detail;
      }

      // it's time to fire the callback
      return callback( event );

    }, useCapture || false );
  }

})(window,document);

(function(global) {
	'use strict';


	// Event emitter
  var Emitter = function() {};
  Emitter.prototype = {
    on: function(event, fct) {
      this._events = this._events || {};
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
    },
    off: function(event, fct) {
      this._events = this._events || {};
      if (event in this._events === false) return;
      this._events[event].splice(this._events[event].indexOf(fct), 1);
    },
    emit: function(event /* , args... */ ) {
      this._events = this._events || {};
      if (event in this._events === false) return;
      for (var i = 0; i < this._events[event].length; i++) {
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };

  // Mixin method
  Emitter.mixin = function(obj) {
    var props = ['on', 'off', 'emit'];
    for (var i = 0; i < props.length; i++) {
      if (typeof obj === 'function') {
        obj.prototype[props[i]] = Emitter.prototype[props[i]];
      } else {
        obj[props[i]] = Emitter.prototype[props[i]];
      }
    }
    return obj;
  };

	// Utilities
  var util = {
    extend: function(src, props) {
      props = props || {};
      var p;
      for (p in src) {
        if (!props.hasOwnProperty(p)) {
          props[p] = src[p];
        }
      }
      return props;
    },
    each: function(a, b, c) {
      if ("[object Object]" === Object.prototype.toString.call(a)) {
        for (var d in a) {
          if (Object.prototype.hasOwnProperty.call(a, d)) {
            b.call(c, d, a[d], a);
          }
        }
      } else {
        for (var e = 0, f = a.length; e < f; e++) {
          b.call(c, e, a[e], a);
        }
      }
    },
    createElement: function(a, b) {
      var c = document,
        d = c.createElement(a);
      if (b && "object" == typeof b) {
        var e;
        for (e in b)
          if ("html" === e) d.innerHTML = b[e];
          else if ("text" === e) {
          var f = c.createTextNode(b[e]);
          d.appendChild(f);
        } else d.setAttribute(e, b[e]);
      }
      return d;
    },
    css: function(el, prop, val) {
      var style = el && el.style,
        isObj = "[object Object]" === Object.prototype.toString.call(prop);

      if (style) {
        if (val === void 0 && !isObj) {
          val = window.getComputedStyle(el, '');
          return prop === void 0 ? val : val[prop];
        } else {
          if (isObj) {
            util.each(prop, function(p, v) {
              if (!(p in style)) {
                p = '-webkit-' + p;
              }

              style[p] = v + (typeof v === 'string' ? '' : 'px');
            });
          } else {
            if (!(prop in style)) {
              prop = '-webkit-' + prop;
            }

            style[prop] = val + (typeof val === 'string' ? '' : 'px');
          }
        }
      }
    },
    hasClass: function(a, b) {
      return a.classList ? a.classList.contains(b) : !!a.className && !!a.className.match(new RegExp("(\\s|^)" + b + "(\\s|$)"));
    },
    addClass: function(a, b) {
      if (!util.hasClass(a, b)) {
        if (a.classList) {
          a.classList.add(b);
        } else {
          a.className = a.className.trim() + " " + b;
        }
      }
    },
    removeClass: function(a, b) {
      if (util.hasClass(a, b)) {
        if (a.classList) {
          a.classList.remove(b);
        } else {
          a.className = a.className.replace(new RegExp("(^|\\s)" + b.split(" ").join("|") + "(\\s|$)", "gi"), " ");
        }
      }
    },
    on: function(e, type, callback, scope) {
      e.addEventListener(type, function(e) {
        scope = scope || this;
        callback.call(scope, e);
      }, false);
    },
    off: function(e, type, callback) {
      e.removeEventListener(type, callback);
    },
    debounce: function(a, b, c) {
      var d;
      return function() {
        var e = this,
          f = arguments,
          g = function() {
            d = null;
            if (!c) a.apply(e, f);
          },
          h = c && !d;
        clearTimeout(d);
        d = setTimeout(g, b);
        if (h) {
          a.apply(e, f);
        }
      };
    },
    getBoundingRect: function(el, margins) {
      var win = window;
      var doc = document;
      var body = doc.body;
      var rect = el.getBoundingClientRect();
      var offsetX = win.pageXOffset !== undefined ? win.pageXOffset : (doc.documentElement || body.parentNode || body).scrollLeft;
      var offsetY = win.pageYOffset !== undefined ? win.pageYOffset : (doc.documentElement || body.parentNode || body).scrollTop;

      var mt = 0, ml = 0;

      if (margins) {
        mt = parseInt(util.css(el, 'margin-top'), 10);
        ml = parseInt(util.css(el, 'margin-left'), 10);
      }

      return {
        bottom: rect.bottom + offsetY,
        height: rect.height,
        left: rect.left + offsetX - ml,
        right: rect.right + offsetX,
        top: rect.top + offsetY - mt,
        width: rect.width
      };
    },
  };

	/**
	 * Default options
	 * @type {Object}
	 */
	var defaultConfig = {
		/**
		 * Set the comparison type: side-by-side, layered or hover
		 * @type {String}
		 */
		type: "side-by-side",

		/**
		 * Toggle drag handle / bar (side-by-side type only)
		 * @type {Boolean}
		 */
		handle: true,

		/**
		 * Set the handle width
		 * @type {Number}
		 */
		handleWidth: 5,

		/**
		 * Toggle zooming / scaling
		 * @type {Boolean}
		 */
		zoom: false,

		/**
		 * Toggle panning / dragging
		 * @type {Boolean}
		 */
		pan: false,

		/**
		 * Toggle label visibility
		 * @type {Boolean}
		 */
		showLabels: true
	};

	/**
	 * Creates a new drag handle for side-by-side comparison type
	 * @param {HTMLElement} container The parent container
	 * @param {Number} width     The width of the drag handle
	 * @param {DOMRect} rect      The container's DOMRect object
	 */
	function Handle(container, width, rect) {

		Emitter.mixin(this);

		this.width = width;
		this.dragging = false;

		this.pRect = rect;

		this.offset = (rect.width * 0.5) - (this.width * 0.5);
		this.current = 0;

		this.el = util.createElement("div", {
			class: "cmpr-handle"
		});

		util.css(this.el, {
			left: this.offset,
			width: width
		});

		container.appendChild(this.el);

		util.on(this.el, "mousedown", function(e) {
			this.dragging = true;

			this.origin = e.pageX;
			this.offsetX = e.offsetX;
			this.rect = util.getBoundingRect(this.el);

			this.emit("handle.mousedown");
		}, this);

		util.on(document, "mousemove", function(e) {
			if ( this.dragging ) {

				this.limit(e);

				util.css(this.el, {
					transform: "translate3d("+this.current+"px,0px,0)"
				});

				this.emit("handle.drag", e.pageX - this.pRect.left - this.offsetX);
			}

			this.emit("handle.mousemove");
		}, this);

		util.on(document, "mouseup", function(e) {
			if ( this.dragging ) {
				this.dragging = false;

				this.offset = e.pageX - this.pRect.left - this.offsetX;

				// Prevent handle from disappearing
				if ( e.pageX < this.pRect.left ) {
					this.offset = 0;
				}

				if ( e.pageX > this.pRect.left + this.pRect.width ) {
					this.offset = this.pRect.width - this.width;
				}

				util.css(this.el, {
					transform: "",
					left: this.offset
				});

				// Reset or dragging the handle will break clip calculation
				this.current = 0;

				this.emit("handle.drag.end");
			}

			this.emit("handle.mouseup");
		}, this);
	}

	/**
	 * Handle prototype
	 * @type {Object}
	 */
	Handle.prototype = {
		update: function(offset) {
			this.pRect = util.getBoundingRect(this.el.parentNode);
			this.current = 0;
			this.offset = offset || (this.pRect.width * 0.5) - (this.width * 0.5);

			util.css(this.el, {
				left: this.offset
			});
		},

		limit: function(e) {

			var x = e.pageX - this.origin;

			if ( e.pageX - this.offsetX <= this.pRect.left ) {
				x = -this.offset;
			}

			if ( e.pageX + (this.width - this.offsetX) >= this.pRect.right ) {
				x = this.pRect.width - this.offset - this.width;
			}

			this.current = x;
		}
	};


	/**
	 * Stores 3d transform info
	 * @param {Number} originX [description]
	 * @param {Number} originY [description]
	 * @param {Number} transX  [description]
	 * @param {Number} transY  [description]
	 * @param {Number} scale   [description]
	 * @param {DOMRect} rects   [description]
	 */
	var Transform = function(originX, originY, transX, transY, scale, rects){
		this.originX = originX;
		this.originY = originY;
		this.transX = transX;
		this.transY = transY;
		this.scale = scale;
		this.rects = rects;
	};

	/**
	 * Transform prototype
	 * @type {Object}
	 */
	Transform.prototype = {
		/**
		 * Get current scale
		 * @return {Number}
		 */
		getScale: function() { return this.scale; },

		/**
		 * Get current origin x value (transform-origin: x y z)
		 * @return {Number}
		 */
		getOriginX: function() { return this.originX; },

		/**
		 * Get current origin y value (transform-origin: x y z)
		 * @return {Number}
		 */
		getOriginY: function() { return this.originY; },

		/**
		 * Get current x value of the 3d translate
		 * @return {Number}
		 */
		getTranslateX: function() { return this.transX; },

		/**
		 * Get current xy value of the 3d translate
		 * @return {Number}
		 */
		getTranslateY: function() { return this.transY; },

		/**
		 * Get current DOMRect object
		 * @return {Object}
		 */
		getBoundingRect: function() { return this.rects; }
	};

	/**
	 * Creates a new frame for zooming and panning
	 * @param {HTMLElement} element The element to apply yhr 3d transforms to
	 * @param {Object} config  Configuration settings
	 */
	var Frame = function(element, config) {
		this.element = element;

		this.config = util.extend({
			zoom: true,
			pan: true,
			limitToFrame: true
		}, config);

		this.dragging = false;

		this.update();

		this.transform = new Transform(0, 0, 0, 0, 1, this.elRect);

		Emitter.mixin(this);

		// Mousewheel (magnify)
		addWheelListener(element, this.onMouseWheel.bind(this));

		// Mousedown
		util.on(element, "mousedown", this.onMouseDown.bind(this));

		// Mousemove (pan)
		util.on(document, "mousemove", this.onMouseMove.bind(this));

		// Mouseup
		util.on(document, "mouseup", this.onMouseUp.bind(this));
	};

	/**
	 * Frame prototype
	 * @type {Object}
	 */
	Frame.prototype = {
		/**
		 * Mousewheel callback
		 * @param  {Event} e
		 * @return {Void}
		 */
		onMouseWheel: function(e) {
			var delta = Math.max(-1, Math.min(1, -e.deltaY));

			if ( this.config.zoom ) {
				this.zoom(e.pageX, e.pageY, false, delta);

				e.preventDefault();
			}
		},

		/**
		 * Mousedown callback
		 * @param  {Event} e
		 * @return {Void}
		 */
		onMouseDown: function(e) {
			if ( !this.config.pan ) return;

			this.elRect = util.getBoundingRect(this.element);

			var current = this.getTransform();

			if ( current.scale > 1 ) {
				this.dragOrigin = {
					x: e.pageX,
					y: e.pageY,
				};

				this.dragging = true;

				e.preventDefault();
			}

			this.emit("frame.mousedown");
		},

		/**
		 * Mousemove callback
		 * @param  {Event} e
		 * @return {Void}
		 */
		onMouseMove: function(e) {
			if ( this.dragging ) {
				var t = this.pan(e);

				this.applyTransform(this.getTransform(), t);

				this.emit("frame.pan");
			}
		},

		/**
		 * Mouseup callback
		 * @param  {Event} e
		 * @return {Void}
		 */
		onMouseUp: function(e) {
			if ( this.dragging ) {
				this.dragging = false;

				var current = this.getTransform();

				var t = this.limit(e);

				current.transX += t.x;
				current.transY += t.y;
			}

			this.emit("frame.mouseup");
		},

		/**
		 * Zoom / scale the element
		 * @param  {Number} x         The x offset
		 * @param  {Number} y         The y offset
		 * @param  {Number} magnitude The scale amount
		 * @param  {Number} delta     Zooming in (1) or out (-1)
		 * @return {Void}
		 */
		zoom: function(x, y, magnitude, delta) {

			x = x || this.elRect.width * 0.5;
			y = y || this.elRect.height * 0.5;

			// current scale
			var ps = this.transform.getScale();
			// new scale
			var ns = magnitude || ps + delta/10;

			// scale limits
			var ms = 20;
			if ( ns < 1 ) {
				ns = 1;
			} else if ( ns > ms ) {
				ns = ms;
			}
			// current cursor position on image
			var ix = (x - this.elRect.left).toFixed(2);
			var iy = (y - this.elRect.top).toFixed(2);

			// previous cursor position on image
			var px = (this.transform.getOriginX() * ps).toFixed(2);
			var py = (this.transform.getOriginY() * ps).toFixed(2);

			// previous magnify frame translate
			var tx = this.transform.getTranslateX();
			var ty = this.transform.getTranslateY();

			// set origin to current cursor position
			var nx = ix / ps;
			var ny = iy / ps;

			// Magnify frame to current cursor position
			if ((Math.abs(ix-px)>1 || Math.abs(iy-py)>1) && ps < ms) {
				tx += (ix-px)*(1-1/ps);
				ty += (iy-py)*(1-1/ps);
			}

			// Magnify on previous cursor position
			else if(ps != 1 || ix != px && iy != py) {
				nx = px / ps;
				ny = py / ps;
			}

			// Constrain
			if( delta <= 0 && (this.config.limitToFrame || ns == 1) ) {
				var w = this.elRect.width;
				var h = this.elRect.height;

				// x-axis
				if( tx + nx + ( w - nx ) * ns <= w ) {
					tx = 0;
					nx = w;
				} else if ( tx + nx * ( 1 - ns ) >= 0 ) {
					tx = 0;
					nx = 0;
				}

				// y-axis
				if( ty + ny + ( h - ny ) * ns <= h ) {
					ty = 0;
					ny = h;
				} else if ( ty + ny * ( 1 - ns ) >= 0 ) {
					ty = 0;
					ny = 0;
				}
			}
			
			this.transform = new Transform(nx, ny, tx, ty, ns, this.elRect);

			this.applyTransform();

			this.elRect = util.getBoundingRect(this.element);

			this.emit("frame.zoom", delta);
		},

		/**
		 * Update rects
		 * @return {Void}
		 */
		update: function() {
			this.elRect = util.getBoundingRect(this.element);
			this.ptRect = util.getBoundingRect(this.element.parentNode);
		},

		/**
		 * Transform setter
		 * @param {Object} t
		 */
		setTransform: function(t) {
			this.transform = t;
		},

		/**
		 * Transform getter
		 * @return {Object}
		 */
		getTransform: function() {
			return this.transform;
		},

		/**
		 * Panning
		 * @param  {Event} e Mouse Event
		 * @return {Object}
		 */
		pan: function(e) {
			var pr = this.ptRect;
			var er = this.elRect;

			var t = {
				x: e.pageX - this.dragOrigin.x,
				y: e.pageY - this.dragOrigin.y
			};

			if ( this.config.limitToFrame ) {
				if ( er.top + t.y >= pr.top ) {
					t.y = pr.top - er.top;
				}

				if ( er.bottom + t.y <= pr.bottom ) {
					t.y = pr.top - er.top - (er.height - pr.height);
				}

				if ( er.left + t.x > pr.left ) {
					t.x = pr.left - er.left;
				}

				if ( er.right + t.x <= pr.right ) {
					t.x = pr.left - er.left - (er.width - pr.width);
				}
			}

			return t;
		},

		/**
		 * Apply the transform styles to the element
		 * @param  {Object} t Current transform info
		 * @param  {Object} o Mouse info for panning
		 * @return {Void}
		 */
		applyTransform: function(t, o) {
			var matrix;
			var scale = this.transform.getScale().toFixed(1);
			var x = this.transform.getTranslateX();
			var y = this.transform.getTranslateY();
			var origin = [ this.transform.getOriginX().toFixed(10), this.transform.getOriginY().toFixed(10), 0 ];

			// Panning
			if ( o ) {
				x += o.x;
				y += o.y;
			}

			matrix = ["matrix(" + this.transform.getScale().toFixed(1)];
			matrix.push(0);
			matrix.push(0);
			matrix.push(scale);
			matrix.push(x.toFixed(1));
			matrix.push(y.toFixed(1) + ")");

			util.css(this.element, {
				"transform-origin": origin.join("px "),
				"transform": matrix.join(",")
			});
		}
	};

	/**
	 * Main lib
	 * @param {HTMLElement or CSS3 selector sting} parent The parent element to append to
	 * @param {Object} config Custom configuration
	 */
	var Differential = function(parent, config) {
		this.parent = parent;

		if ( typeof parent === "string" ) {
			this.parent = document.querySelector(parent);
		}

		Emitter.mixin(this);

		this.config = util.extend(defaultConfig, config);
		this.rect = util.getBoundingRect(this.parent);

		this.images = [];

		this.width = 0;
		this.height = 0;
		this.naturalWidth = 0;
		this.naturalHeight = 0;

		this.initialised = false;

		this.container = util.createElement("div", {
			class: "cmpr-container"
		});

		this.imageWrapper = util.createElement("div", {
			class: "cmpr-image-wrapper"
		});

    var labels;
		if ( this.config.showLabels ) {
			labels = util.createElement("div", {
					class: "cmpr-labels"
			});
			this.labels = [];
		}

		util.each(this.config.images, function(i, image) {
			this.images[i] = util.createElement("img", {
				class: "cmpr-image",
				src: image.src,
				title: image.label
			});

			this.images[i].idx = i;

			if ( i === 0 ) {
				this.images[i].classList.add("top");
			}

			// Is there a label defined and can we show it?
			if ( this.config.showLabels && image.label ) {
				var label = util.createElement("div", {
					class: "cmpr-label " + (i>0?"right":"left"),
					html: image.label
				});
				labels.appendChild(label);

				this.labels[i] = { node: label, label: image.label };
			}

			this.imageWrapper.appendChild(this.images[i]);

			util.on(this.images[i], "load", this.onImageLoaded.bind(this));
		}, this);

		this.container.appendChild(labels);
		this.container.appendChild(this.imageWrapper);
	};

	/**
	 * Detect images dimensions and trigger init when all are loaded
	 * @param  {Event} e Image event
	 * @return {Void}
	 */
	Differential.prototype.onImageLoaded = function(e) {
			var img = e.currentTarget;

			if ( img.naturalHeight > this.height ) {
				this.naturalHeight = img.naturalHeight;
			}
			if ( img.naturalWidth > this.width ) {
				this.naturalWidth = img.naturalWidth;
			}

			if ( img.idx > 0 ) {
				this.init();
			}
	};

	/**
	 * Initialise
	 * @return {Boolean}
	 */
	Differential.prototype.init = function() {

		if ( this.initialised ) return false;

		this.parent.appendChild(this.container);

		this.topImage = this.images[0];

		var compare = this;
		this.ratio = this.rect.width / this.naturalWidth;
		this.height =  this.naturalHeight * this.ratio;
		this.width =  this.naturalWidth * this.ratio;

		util.css(this.container, {
				height: this.height,
				width: this.width
		});

		this.setLabels();

		this.frame = new Frame(this.imageWrapper, {
			zoom: this.config.zoom,
			pan: this.config.pan,
			limitToFrame: this.config.type === "side-by-side" || this.config.type === "hover"
		});

		if ( this.config.zoom ) {
			this.enableZoom();

			if ( this.config.pan ) {
				this.enablePan();
			}
		}

		if ( this.config.type === "side-by-side" ) {

			this.container.classList.add("side-by-side");

			this.handle = new Handle(this.container, this.config.handleWidth, this.rect);

			// Handle drag
			this.handle.on("handle.drag", function(offset) {

				if ( compare.config.showLabels && compare.labels.length ) {
					var list, hide = false;

					// Hide labels that are behind the handle
					util.each(compare.labels, function(i, label) {
						list = label.node.classList;
						hide = (
							(i === 0 && offset <= (label.rect.left - compare.rect.left) + label.rect.width) ||
							 i == 1 && offset >= (label.rect.left - compare.rect.left)
						);
						label.node.classList.toggle("hide", hide);
					});
				}

				compare.setClip();
			});

			// Update clip
			this.setClip();
		} else if ( this.config.type === "layered" ) {

			this.container.classList.add("layered");

		} else if ( this.config.type === "hover" ) {
			this.container.classList.add("hover");
			this.labels[0].node.classList.add("docked");

			var el = util.createElement("div", { class: "cmpr-window" });
			this.container.appendChild(el);

			this.window = {
				node: el,
				rect: util.getBoundingRect(el),
				mouse: { x: 0, y: 0 }
			};

			this.toggleImages();

			util.on(this.parent, "mousemove", function(e) {
				this.window.mouse = {
					x: e.offsetX,
					y: e.offsetY
				};
				
				var scale = this.frame.getTransform().getScale();
				
				var x = (e.pageX - this.rect.left) - (this.window.rect.width * 0.5);
				var y = (e.pageY - this.rect.top) - (this.window.rect.height * 0.5);


				// Update window
				util.css(this.window.node, {
					transform: "translate3d(" + x + "px, " + y + "px, 0px)"
				});

				util.css(this.labels[0].node, {
					width: this.window.rect.width,
					top: -this.labels[0].rect.height,
					transform: "translate3d(" + x + "px, " + y + "px, 0px)"
				});
				this.setClip();
			}, this);
		}

		util.on(this.container, "mousedown", function(e) {
			e.preventDefault();
			return false;
		});

		this.resize = util.debounce(function() {

			var offset, oldRect = this.rect;

			this.rect = util.getBoundingRect(this.parent);
			this.ratio = this.rect.width / this.naturalWidth;
			this.height =  this.naturalHeight * this.ratio;
			this.width =  this.naturalWidth * this.ratio;

			util.css(this.container, {
					height: this.height,
					width: this.width
			});

			this.frame.update();

			if ( this.config.type === "side-by-side" ) {
				offset = this.rect.width * (this.handle.offset / oldRect.width);
				this.handle.update(offset);
			}


			var transform = this.frame.getTransform();
			this.frame.applyTransform(transform);
			this.frame.setTransform(transform);
			this.frame.setMagnification();

			this.setClip();
			this.setLabels();
		}, 50);

		util.on(window, "resize", this.resize.bind(this));

		this.resize();

		var d = this;
		setTimeout(function() {
			d.emit("init");
			d.initialised = true;
		}, 10);
	};

	/**
	 * Set label dimensions
	 */
	Differential.prototype.setLabels = function() {
		if ( this.config.showLabels && this.labels.length ) {
			util.each(this.labels, function(i, label) {
				label.rect = util.getBoundingRect(label.node);
			}, this);
		}
	};

	/**
	 * Update the clip
	 */
	Differential.prototype.setClip = function() {

		if ( this.config.type === "layered" ) return false;

		// TODO: Remove reliance on getBoundingClientRect
		var x, y, t, l ,r, b,
				rect = util.getBoundingRect(this.imageWrapper),
				scale = this.frame.getTransform().getScale();

		var dx = (this.rect.left - rect.left);
		var dy = (this.rect.top - rect.top);

		if ( this.config.type === "hover" ) {

			t = this.window.mouse.y - (this.window.rect.height * 0.5) / scale;
			l = this.window.mouse.x - (this.window.rect.width * 0.5) / scale;
			r = l + this.window.rect.width / scale;
			b = t + this.window.rect.height / scale;

		} else {
			t = 0;
			l = 0;
			r = (dx / scale) + ((this.handle.offset + this.handle.current + this.ratio) / scale);
			b = this.height;
		}

		// Update clip
		util.css(this.topImage, {
			clip: ["rect("+ t, r, b, l + "px)"].join("px, ")
		});
	};

	/**
	 * Zoom callback
	 * @param  {[type]} delta     Zoom in (1) or out (-1)
	 * @param  {[type]} transform Current frame transformation data
	 * @return {Void}
	 */
	Differential.prototype.onZoom = function(delta) {
		var compare = this;
		var transform = this.frame.getTransform();

		this.container.classList.toggle("pan", transform.getScale() > 1);
		this.container.classList.toggle("zoom-in", delta > 0);

		if ( transform.scale > 1) {
			this.container.classList.toggle("zoom-out", delta < 0);
		}

		this.setClip();

		setTimeout(function() {
			compare.container.classList.remove("zoom-in", "zoom-out");
		}, 200);
	};

	/**
	 * Enable the zoom engine
	 * @return {Void}
	 */
	Differential.prototype.enableZoom = function() {
		this.frame.config.zoom = true;
		this.container.classList.add("zoomable");
		this.frame.on("frame.zoom", this.onZoom.bind(this));
	};

	/**
	 * Disable the zoom engine
	 * @return {Void}
	 */
	Differential.prototype.disableZoom = function() {
		this.frame.config.zoom = false;
		this.container.classList.remove("zoomable");
		this.frame.off("frame.zoom", this.onZoom.bind(this));
	};

	/**
	 * Zoom method
	 * @param  {Number} x         The x offser
	 * @param  {Number} y         The y offset
	 * @param  {Number} magnitude Zoom magnitude
	 * @param  {Number} delta     Zoom in (1) or out (-1)
	 * @return {Void}
	 */
	Differential.prototype.zoom = function(x, y, magnitude, delta) {
		x += this.frame.ptRect.left;
		y += this.frame.ptRect.top;

		this.frame.zoom(x, y, magnitude, delta ? -1 : 1);
	};

	/**
	 * Enable panning engine
	 * @return {Void}
	 */
	Differential.prototype.enablePan = function() {
		this.frame.config.pan = true;
		this.container.classList.add("pannable");
		this.frame.on("frame.pan", this.onPan.bind(this));
	};

	/**
	 * Disable panning engine
	 * @return {Void}
	 */
	Differential.prototype.disablePan = function() {
		this.frame.config.pan = false;
		this.container.classList.remove("pannable");
		this.frame.off("frame.pan", this.onPan.bind(this));
	};

	/**
	 * Panning callback
	 * @return {Void}
	 */
	Differential.prototype.onPan = function() {
		this.setClip();
	};

	/**
	 * Swap the image order
	 * @return {Void}
	 */
	Differential.prototype.toggleImages = function() {
		var cl, t;
		util.each(this.images, function(i, image) {
			cl = image.classList; t = cl.contains("top");

			if ( !t ) {
				this.topImage = image;
			} else {
				util.css(image, { clip: "" });
			}

			cl.toggle("top", !t);
		}, this);

		this.swapLabels();
		this.setClip();
	};

	/**
	 * Swap the label order
	 * @return {Void}
	 */
	Differential.prototype.swapLabels = function() {
		var list, left;

		util.each(this.labels, function(i, label) {
			list = label.node.classList; left = list.contains("left");
			list.toggle("left", !left);
			list.toggle("right", left);

			if ( this.config.type === "hover" ) {
				var docked = list.contains("docked");

				if ( !docked ) {
					list.add("docked");
				} else {
					util.css(label.node, {
						top: "",
						width: "",
						transform: ""
					});
					list.remove("docked");
				}
			}
		}, this);

		// flip the elements
		this.labels[0].node.parentNode.appendChild(this.labels[0].node);

		// flip the reference array
		this.labels.reverse();

		// update
		this.setLabels();
	};

	// Export
	global.Differential = Differential;

}(this));