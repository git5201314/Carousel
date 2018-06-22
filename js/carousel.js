;(function($){
	function Carousel(el, options){
		this.$el = $(el);
		
		if(!options){
			options = this.getConfig();
		}
		
		this.opts = $.extend(true, {}, Carousel.DEFAULTS, options || {});
		
		this.init();
	}
	
	Carousel.prototype = {
		
		init: function(){
			var $el = this.$el;
			
			this.$posterItems = $el.find('.poster-item');		//幻灯片的所有项
			this.$posterFirst = this.$posterItems.slice(0, 1);	//幻灯片的第一项
			this.length = this.itemsCount();					//幻灯片的长度
			
			if(this.length % 2 === 0){		//处理偶数张幻灯片
				this.$el.find('.poster-list').append(this.$posterFirst.clone());
				this.$posterItems = $el.find('.poster-item');
				this.$posterFirst = this.$posterItems.slice(0, 1);
				this.length = this.itemsCount();
			}
			
			this.$rightItems = this.$posterItems.slice( 1, Math.ceil(this.length / 2) );	//幻灯片右边所有项
			this.$leftItems = this.$posterItems.slice(Math.ceil(this.length / 2));			//幻灯片左边所有项
			this.$prevBtn = $el.find('.prev-btn');			//上一张按钮
			this.$nextBtn = $el.find('.next-btn');			//下一张按钮
			
			this._setValue();
			
			this._bindEvent();
		},
		
		_setValue: function(){
			var me = this;
			
			var opts = me.opts,
				$el = me.$el;
			
			$el.css({	//设置幻灯片的宽高
				'width': opts.width,
				'height': opts.height
			});

			var zIndex = Math.ceil(me.length / 2),
				left = (opts.width - opts.firstWidth) / 2;
			
			me.$posterFirst.css({		//设置幻灯片第一项的css值
				'width': opts.firstWidth,
				'height': opts.firstHeight,
				'zIndex': zIndex,
				'left': left
			});
						
			me.$prevBtn.css({
				'width': left,
				'height': opts.height,
				'zIndex': zIndex,
				'left': 0
			});
			
			me.$nextBtn.css({
				'width': left,
				'height': opts.height,
				'zIndex': zIndex,
				'right': 0
			});
			
			var scale = opts.scale,
				lWidth = opts.firstWidth,
				lHeight = opts.firstHeight,
				lIndex = zIndex,
				gap = (opts.width - lWidth) / (me.length - 1),
				len = me.$leftItems.length;

			me.$leftItems.each(function(i){
				var pow = Math.pow(scale, len - i),
					w = lWidth * pow,
					h = lHeight * pow,
					lTop = me._getTop(h);

				$(this).css({
					'width': w,
					'height': h,
					'zIndex': i + 1,
					'opacity': pow * scale,
					'left': i * gap,
					'top': lTop
				});
			});
			
			var rWidth = opts.firstWidth,
				rHeight = opts.firstHeight,
				rIndex = zIndex,
				rOpacity = scale;
			
			me.$rightItems.each(function(i){	//设置右边每一项的css值
				rWidth *= scale;
				rHeight *= scale;
				rOpacity *= scale;
				
				var rLeft = left + opts.firstWidth + (i + 1) * gap - rWidth,
					rTop = me._getTop(rHeight);

				$(this).css({
					'width': rWidth,
					'height': rHeight,
					'zIndex': --rIndex,
					'opacity': rOpacity,
					'left': rLeft,
					'top': rTop
				});
			});
		},
		
		_bindEvent: function(){
			var me = this;
			
			me.animate = true;
			
			me.$prevBtn.click(function(){
				if(me.animate){
					me._move('prev');
					me.animate = false;
				}
			});
			
			me.$nextBtn.click(function(){
				if(me.animate){
					me._move('next');
					me.animate = false;
				}
			});
			
			if(me.opts.auto){
				me.autoPlay();
				
				me.$el.hover(function(){
					clearInterval(me.timer);
				}, function(){
					me.autoPlay();
				});
			}
		},
		
		getConfig: function(){
			try{
				return JSON.parse( this.$el.attr('data-config') );
			}catch(ex){
				throw new Error('元素没有正确配置data-config属性');
			}
		},
		
		_move: function(dir){
			var me = this,
				zIndexArr = [],
				opacityArr = [];
			
			me.$posterItems.each(function(){
				var $this = $(this),
					$el = null;
				
				if(dir === 'prev'){
					$el = $this.next().get(0) ? $this.next() : me.$posterItems.first();
				}else if(dir === 'next'){
					$el = $this.prev().get(0) ? $this.prev() : me.$posterItems.last();
				}
				
				var w = $el.width(),
					h = $el.height(),
					z = $el.css('zIndex'),
					o = $el.css('opacity'),
					pos = $el.position(),
					l = pos.left,
					t = pos.top;
				
				zIndexArr.push(z);
				opacityArr.push(o);
				
				$this.animate({
					'width': w,
					'height': h,
					'left': l,
					'top': t
				}, me.opts.speed, function(){
					me.animate = true;
				});
			});
			
			me.$posterItems.each(function(i){
				$(this).css({
					'opacity': opacityArr[i],
					'zIndex': zIndexArr[i]
				});
			});
		},
		
		autoPlay: function(){
			var me = this;
			
			me.timer = setInterval(function(){
				me.$nextBtn.trigger('click');
			}, me.opts.auto)
		},
		
		itemsCount: function(){
			return this.$posterItems.length;
		},
		
		_getTop: function(h){
			var top = 0,
				tmp = this.opts.verticalAlign,
				height = this.opts.height;		
			
			if(tmp === 'top'){
				top = 0;
			}else if(tmp === 'bottom'){
				top = height - h;
			}else{
				top = (height - h) / 2;
			}
			
			return top;
		}
	};
	
	Carousel.DEFAULTS = {
		'width': 800,					//幻灯片总宽度
		'height': 270,					//幻灯片总高度
		'firstWidth': 640,				//幻灯片第一张宽度
		'firstHeight': 270,			//幻灯片第一张高度
		'scale': 0.9,					//幻灯片每张缩放比例
		'verticalAlign': 'middle',		//幻灯片垂直对齐方式
		'speed': 500,				//幻灯片切换速度
		'auto': 3000					//幻灯片是否支持自动播放
	};
	
	$.fn.extend({
		carousel: function(options){
			return this.each(function(){
				var $this = $(this),
					instance = $this.data('carousel');
					
				if(!instance){
					$this.data('carousel', (instance = new Carousel($this, options)));
				}
				
				if($.type(options) === 'string'){
					$.type(instance[options]) === 'function' && instance[options]();
				}
			});
		}
	});
})(jQuery);
