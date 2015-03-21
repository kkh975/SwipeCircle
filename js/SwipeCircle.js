/*!*
 * @autor: Blim - Koo Chi Hoon(kkh975@naver.com)
 * @license http://blim.mit-license.org/
 */
( function( $ ){

	'use strict';

	/**
	 * @method: 슬라이더 플러그인
	 */
	$.fn.swipeCircle = function( option ){
		option.$list = option.$list ? option.$list : $( this ).find( '> ul > li' );
		option.list = option.$list ? option.$list.toArray() : [];
		option.pages = option.$pages ? option.$pages.toArray() : null;
		option.toStart = option.$toStart ? option.$toStart.toArray() : null;
		option.toStop = option.$toStop ? option.$toStop.toArray() : null;
		option.toPrev = option.$toPrev ? option.$toPrev.toArray() : null;
		option.toNext = option.$toNext ? option.$toNext.toArray() : null;

		return this.each( function(){
			$( this ).data( 'swipeCircle', new SwipeCircle( option ));
		});
	};

	/**
	 * @method: 슬라이더쇼 시작 플러그인
	 */
	$.fn.swipeCircle2start = function(){
		return this.each( function(){
			$( this ).data( 'swipeCircle' ).startSlideShow();
		});
	};

	/**
	 * @method: 슬라이더쇼 정지 플러그인
	 */
	$.fn.swipeCircle2stop = function(){
		return this.each( function(){
			$( this ).data( 'swipeCircle' ).stopSlideShow();
		});
	};

	/**
	 * @method: 이전 슬라이더 이동 플러그인
	 */
	$.fn.swipeCircle2prev = function(){
		return this.each( function(){
			$( this ).data( 'swipeCircle' ).toPrev();
		});
	};

	/**
	 * @method: 다음 슬라이더 이동 플러그인
	 */
	$.fn.swipeCircle2next = function(){
		return this.each( function(){
			$( this ).data( 'swipeCircle' ).toNext();
		});
	};

	/**
	 * @method: 특정 슬라이더 이동 플러그인
	 */
	$.fn.swipeCircle2slide = function( _idx ){
		return this.each( function(){
			$( this ).data( 'swipeCircle' ).toSlide( _idx );
		});
	};

	/**
	 * @method: 슬라이드 제거
	 */       
	$.fn.swipeCircle2destory = function( _idx ){
		return this.each( function(){
			$( this ).data( 'swipeCircle' ).destory();
		});
	};
}( jQuery ));

/**
 * @method: SwipeCircle 함수
 */
function SwipeCircle( __setting ){

	'use strict';

	var BASE_DISTANCE      = 100,		// SwipeCircle의 경우, 
		BASE_ROTATE        = 90,		// rotate가 아니기 때문에 거리와 각도를 구별
		setting            = null,
		D_Wrap             = null,
		D_Plist            = null,
		D_List             = null,
		D_To_Pages         = null,
		D_To_Start         = null,
		D_To_Stop          = null,
		D_To_Prev          = null,
		D_To_Next          = null,
		slide_Show_Timer   = null,
		is_Loop_Len_2      = false,
		is_Slide_Show      = false,
		is_Move            = false,
		list_Width         = 0,
		list_Len           = 0,
		cube_Radius        = 0,			// list를 원으로 놓았을 때, 반지름
		cube_Angle         = 0,			// item의 한쪽의 각
		list_Angle_Arr     = [],		// item별 위치
		now_Idx            = 0,
		to_Idx             = 0,
		browser_Prefix     = {};

	var default_Option = {
		wrap: null,					// require, 리스트 감싸는 태그
		list: null,					// require, 리스트
		pages: null,				// 슬라이더 페이징 이동
		toStart: null,				// 애니메이션 시작 버튼
		toStop: null,				// 애니메이션 멈춤 버튼
		toPrev: null,				// 이전 이동 버튼
		toNext: null,				// 다음 이동 버튼
		startEvents: 'click',		// 슬라이드쇼 시작 이벤트
		stopEvents: 'click',		// 슬라이드쇼 정지 이벤트
		moveEvents: 'click',		// 이동 작동 이벤트
		pageEvents: 'click',		// 페이징 작동 이벤트
		slideShowTime: 3000,		// 슬라이드쇼 시간
		touchMinumRange: 10,		// 터치시 최소 이동 거리
		loop: true,					// 무한 여부
		duration: 500,				// 애니메이션 시간
		create: null,				// 생성 후 콜백함수
		before: null,				// 액션 전 콜백함수
		active: null				// 액션 후 콜백함수
	};

	var helper = { // 보조함수

		/**
		 * @method: jQuery extend 기능
		 */
		extend: function( _target, _object ){
			var prop = null,
				return_obj = {};

			for( prop in _target ){
				return_obj[ prop ] = prop in _object ? _object[ prop ] : _target[ prop ];
			}

			return return_obj;
		},

		/**
		 * @method: 배열 여부
		 */
		isArray: function( _arr ){
			if ( _arr ){
				return Object.prototype.toString.call( _arr ) === '[object Array]';
			}

			return false;
		},

		/**
		 * @method: string trim
		 */
		trim: function( _txt ){
			return _txt.replace( /(^\s*)|(\s*$)/gi, '' );
		},

		/**
		 * @method: DOM에서 배열변환
		 */
		dom2Array: function( _dom ){
			return _dom.length > 0 ? Array.prototype.slice.call( _dom ) : [ _dom ];
		},

		/**
		 * @method: 각도를 radius로 변경
		 */
		getRadius: function( _degree ){
			return _degree * Math.PI / 180;
		},

		/**
		 * @method: css3의 transition 접미사
		 * @return: {Boolean or String}
		 */
		getCssPrefix: function(){
			/*TRANSITIONENDEVENT_VENDORS = [
				'transitionEnd',
				'transitionend',
				'otransitionend',
				'oTransitionEnd',
				'webkitTransitionEnd' ]*/
			var transitionsCss = [ '-webkit-transition', 'transition' ],
				transformsCss = [ '-webkit-transform', 'transform' ],
				transitionsJs = [ 'webkitTransition', 'transition' ],
				transformsJs = [ 'webkitTransform', 'transform' ],
				transitionsendJs = [ 'webkitTransitionEnd', 'transitionend' ],
				styles = window.getComputedStyle( document.body, '' ),
				prefixCss = ( Array.prototype.slice.call( styles ).join('').match( /-(webkit|moz|ms|o)-/ ) || (styles.OLink === '' && [ '', 'o' ]))[ 1 ],
				prefixJs = ( 'WebKit|Moz|MS|O' ).match( new RegExp('(' + prefixCss + ')', 'i' ))[ 1 ],
				isWebkit = prefixCss === 'webkit';

			return {
				'prefixCss': prefixCss,
				'prefixJs': prefixJs.toLowerCase(),
				'transitionsCss': transitionsCss[ isWebkit ? 0 : 1 ],
				'transformsCss': transformsCss[ isWebkit ? 0 : 1 ],
				'transformsJs': transformsJs[ isWebkit ? 0 : 1 ],
				'transitionsJs': transitionsJs[ isWebkit ? 0 : 1 ],
				'transitionsendJs': transitionsendJs[ isWebkit ? 0 : 1 ]
			};
		},

		/**
		 * @method: css3 transition 지원 여부
		 * @return: {Boolean}
		 */
		hasCss3Transition: function(){
			var Ddiv = document.createElement( 'div' ),
				div_style = Ddiv.style;

			return browser_Prefix.transitionsJs in div_style;
		},

		/**
		 * @method: 현재 위치 알아오기
		 */
		getCss3TransformPos: function( _dom ){
			var this_style = _dom.style,
				css_txt = '';

			css_txt = this_style[ browser_Prefix.transformsJs ];
			css_txt = css_txt.substring( css_txt.indexOf( '(' ) + 1, css_txt.indexOf( 'px' ));

			return parseFloat( css_txt );
		},

		/**
		 * @method: 전체 위치 설정
		 */
		setListTransition: function( _speed, _add_angle, _is_set ){
			var angle = 0,
				i = 0;

			for ( i = 0; i < list_Len; i++ ){
				angle = list_Angle_Arr[ i ];
				angle += _add_angle;

				if ( _is_set){
					list_Angle_Arr[ i ] = angle;	
				}

				helper.setCss3Transition( D_List[ i ], _speed, angle );
			}
		},

		/**
		 * @method: 애니메이션 설정
		 */
		setCss3Transition: function( _dom, _speed, _angle ){
			var radian = helper.getRadius( _angle ),
				x_pos = Math.round( Math.sin( radian ) * cube_Radius ),
				z_pos = Math.round( Math.cos( radian ) * cube_Radius );

			helper.setCss3( _dom, 'transition', _speed + 'ms' );
			helper.setCss3( _dom, 'transform', 'translateX(' + x_pos + 'px) translateZ(' + z_pos + 'px)' );
		},

		/**
		 * @method: css3 설정
		 */
		setCss3: function( _dom, _prop, _value ){
			var this_style = _dom.style;

			if ( _prop === 'transition' ){
				this_style[ browser_Prefix.transitionsJs ] = _value;
			} else if ( _prop === 'transform' ){
				this_style[ browser_Prefix.transformsJs ] = _value;
			} else {
				this_style[ _prop ] = _value;
				this_style[ '-' + browser_Prefix.prefixJs + '-' + _prop ] =  _value;
			}
		},

		/**
		 * @method: 버튼 이벤트 설정
		 */
		setBtnEvent: function( _doms, _evts, _callback ){
			var evt_arr = _evts.split( ',' ),
				evt_idx = evt_arr.length,
				idx = _doms.length,
				evt = '';

			while( --evt_idx > -1 ){
				while( --idx > -1 ){
					evt = helper.trim( evt_arr[ evt_idx ] );

					( function( __idx ){
						_doms[ idx ].addEventListener( evt, function( e ){
							_callback( __idx );
							e.preventDefault();
						});
					}( idx ));
				}
			}
		}
	};

	var touchEvents = { // 이벤트 함수
		is_touch_start: false,
		touch_start_x: 0,
		touch_start_y: 0,
		move_dx: 0,

		/**
		 * @method: 변수 초기화
		 */
		setInitVaiable: function(){
			touchEvents.is_touch_start = false;
			touchEvents.touch_start_x = 0;
			touchEvents.touch_start_y = 0;
			touchEvents.move_dx = 0;
		},

		/**
		 * @method: 이전으로 이동가능한가
		 */
		canPrevMove: function(){
			// 루프가 아니면서 가장자리에 있을때
			if ( !setting.loop && getPrevIdx() === -1 ){ 
				return false;
			}

			return true;
		},

		/**
		 * @method: 이후로 이동가능한가
		 */
		canNextMove: function(){
			var next_idx = getNextIdx(),
				len = ( is_Loop_Len_2 ? list_Len - 2 : list_Len ) - 1;

			// 루프가 아니면서 가장자리에 있을때
			if ( !setting.loop && ( next_idx === -1 || next_idx > len )){ 
				return false;
			}

			return true;
		},

		/**
		 * @method: 터치 시작 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setStart: function( e ){
			if ( touchEvents.is_touch_start || is_Move ){
				return false;
			}

			setAnimateBefore();

			if ( !touchEvents.is_touch_start && e.type === 'touchstart' && e.touches.length === 1 ){
				touchEvents.is_touch_start = true;
				touchEvents.touch_start_x = e.touches[ 0 ].pageX;
				touchEvents.touch_start_y = e.touches[ 0 ].pageY;
				e.preventDefault();
			}
		},

		/**
		 * @method: 터치 중 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setMove: function( e ){
			var drag_dist = 0,
				scroll_dist = 0;

			if ( touchEvents.is_touch_start && e.type === 'touchmove' && e.touches.length === 1 ){
				drag_dist = e.touches[ 0 ].pageX - touchEvents.touch_start_x;	// 가로 이동 거리
				scroll_dist = e.touches[ 0 ].pageY - touchEvents.touch_start_y;	// 세로 이동 거리
				touchEvents.move_dx = ( drag_dist / list_Width ) * 100;			// 가로 이동 백분률

				// 드래그길이가 스크롤길이 보다 클때
				if ( Math.abs( drag_dist ) > Math.abs( scroll_dist )){ 
					touchEvents.move_dx = Math.max( -BASE_ROTATE, Math.min( BASE_ROTATE, touchEvents.move_dx ));
					helper.setListTransition( 0, touchEvents.move_dx );
				}
				
				e.preventDefault();
			}
		},

		/**
		 * @method: 터치 완료 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setEnd: function( e ){
			var over_touch = Math.abs( touchEvents.move_dx ) > setting.touchMinumRange,
				is_to_next = touchEvents.move_dx < 0,
				can_move = is_to_next ? touchEvents.canNextMove() : touchEvents.canPrevMove();
			
			if ( touchEvents.is_touch_start && e.type === 'touchend' ){
				if ( over_touch && can_move ){
					is_Move = false;
					is_to_next ? toNext() : toPrev();
				} else {
					helper.setListTransition( setting.duration, 0 );
				}
			}

			if ( e.type === 'touchcancel' ){
				is_Move = false;
			}
			
			touchEvents.setInitVaiable();
		}
	};

	/**
	 * @method: 생성자
	 */
	function constructor(){
		var tmp_dom = null,
			idx = 0;

		// 플러그인에서 배열로 넘겨줄때 패스
		// javascrit로 바로 들어오면 dom2Array
		setting = helper.extend( default_Option, __setting );
		D_Plist = helper.isArray( setting.wrap ) ? setting.wrap : helper.dom2Array( setting.wrap ); 
		D_List = helper.isArray( setting.list ) ? setting.list : helper.dom2Array( setting.list ); 
		D_To_Pages = helper.isArray( setting.pages ) ? setting.pages : helper.dom2Array( setting.pages );
		D_To_Start = helper.isArray( setting.toStart ) ? setting.toStart : helper.dom2Array( setting.toStart );
		D_To_Stop = helper.isArray( setting.toStop ) ? setting.toStop : helper.dom2Array( setting.toStop );
		D_To_Prev = helper.isArray( setting.toPrev ) ? setting.toPrev : helper.dom2Array( setting.toPrev );
		D_To_Next = helper.isArray( setting.toNext ) ? setting.toNext : helper.dom2Array( setting.toNext );
		
		browser_Prefix = helper.getCssPrefix();
		list_Len = D_List.length;
		D_Plist = D_Plist[ 0 ];
		D_Wrap = D_Plist.parentNode;
		setting.touchMinumRange = Math.max( 1, Math.min( 100, setting.touchMinumRange ));

		if ( list_Len < 2 ){ // list이거나, 리스트가 1이하이면 함수 종료
			return false;
		}

		if ( !( helper.hasCss3Transition() && 'addEventListener' in window )){
			return false;
		}

		if ( setting.slideShowTime ){ // 슬라이드쇼 옵션 존재
			if ( typeof setting.slideShowTime === 'boolean' ){
				is_Slide_Show = setting.slideShowTime;

				if ( is_Slide_Show ){ // true일때, 숫자값 대입
					setting.slideShowTime = default_Option.slideShowTime;
				}
			}

			if ( typeof setting.slideShowTime === 'string' ){
				setting.slideShowTime = parseInt( setting.slideShowTime, 10 );
			}

			if ( isNaN( setting.slideShowTime )){ // 타입이 숫자가 아니면
				is_Slide_Show = false;
			} else {
				is_Slide_Show = true;

				if ( setting.duration * 2 >= setting.slideShowTime ){ // 슬라이드쇼가 애니메이션 시간보다 짧을때
					setting.slideShowTime = setting.duration * 2;
				}
			}
		}

		if ( D_To_Start ){ // 애니메이션 시작 버튼
			helper.setBtnEvent( D_To_Start, setting.startEvents, startSlideShow );
		}

		if ( D_To_Stop ){ // 애니메이션 멈춤 버튼
			helper.setBtnEvent( D_To_Stop, setting.stopEvents, stopSlideShow );
		}

		if ( D_To_Prev ){ // 왼쪽 버튼
			helper.setBtnEvent( D_To_Prev, setting.moveEvents, toPrev );
		}

		if ( D_To_Next ){ // 오른쪽 버튼
			helper.setBtnEvent( D_To_Next, setting.moveEvents, toNext );
		}

		if ( D_To_Pages ){ // 페이징 이동
			helper.setBtnEvent( D_To_Pages, setting.moveEvents, function( _idx ){
				toSlide( _idx );
			});
		}

		if ( list_Len === 2 && setting.loop ){ // 루프이면서 리스트가 두개일때
			tmp_dom = D_List[ 0 ].cloneNode( true ); // 처음 노드 복사
			D_List.push( tmp_dom );
			D_Plist.appendChild( tmp_dom );

			tmp_dom = D_List[ 1 ].cloneNode( true ); // 두번째 노드 복사
			D_List.push( tmp_dom );
			D_Plist.appendChild( tmp_dom );

			is_Loop_Len_2 = true;
			list_Len = 4;
		}

		idx = D_List.length;

		window.addEventListener( 'load', setInitStyle, false );
		D_Wrap.addEventListener( 'touchstart', touchEvents.setStart );
		D_Wrap.addEventListener( 'touchmove', touchEvents.setMove );
		D_Wrap.addEventListener( 'touchend', touchEvents.setEnd );
		D_Wrap.addEventListener( 'touchcancel', touchEvents.setEnd );

		while( --idx > -1 ){ 
			// 데이터 마크
			D_List[ idx ].setAttribute( 'data-swipe-idx', idx );
			
			// 포커스시 애니메이션 on/off
			D_List[ idx ].addEventListener( 'focus', stopSlideShow, false );
			D_List[ idx ].addEventListener( 'blur', startSlideShow, false );

			// transition event
			D_List[ idx ].addEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );
		}

		return true;
	}

	// TODO
	/**
	 * @method: 초기화 스타일
	 */
	function setInitStyle(){
		var css_dom = null,
			css_txt = '',
			angle = 0,
			radian = 0,
			x_pos = 0,
			z_pos = 0,
			len = 0,
			i = 0;

		list_Width = D_Wrap.offsetWidth;
		cube_Radius = list_Width / 2;
		cube_Angle = 360 / list_Len;

		helper.setCss3( D_Wrap, 'perspective', ( list_Width * 2 ) + 'px' );
		helper.setCss3( D_Wrap, 'user-select', 'none' );

		css_txt = 'position: relative; ';
		css_txt += 'width: 100%; ';
		css_txt += 'height: 100%; ';
		D_Plist.style.cssText = css_txt;
		helper.setCss3( D_Plist, 'transformStyle', 'preserve-3d' );
		helper.setCss3( D_Plist, 'transform', 'scale(0.75)' );

		for ( i = 0, len = list_Len; i < len; i++ ){
			angle = cube_Angle * i;
			radian = helper.getRadius( angle );
			// TODO, 설계도 그리기
			x_pos = Math.round( Math.sin( radian ) * cube_Radius );
			z_pos = Math.round( Math.cos( radian ) * cube_Radius );

			list_Angle_Arr.push( angle );

			css_txt = 'position: absolute; ';
			css_txt += 'width: 100%; ';
			css_txt += 'height: 100%; ';
			css_txt += 'height: 100%; ';
			D_List[ i ].style.cssText = css_txt;

			css_txt = 'translateX(' + x_pos + 'px) translateZ(' + z_pos + 'px) ';
			helper.setCss3( D_List[ i ], 'transform', css_txt );
			helper.setCss3( D_List[ i ], 'backfaceVisibility', 'hidden' );
		}

		startSlideShow();

		if ( typeof setting.create === 'function' ){ // 생성 후 콜백
			setting.create( getNowIdx());
		}
	}

	/**
	 * @method: 제거
	 */
	function destory(){
		var idx = D_List.length;

		window.removeEventListener( 'load', setInitStyle, false );
		D_Wrap.removeEventListener( 'touchstart', touchEvents.setStart );
		D_Wrap.removeEventListener( 'touchmove', touchEvents.setMove );
		D_Wrap.removeEventListener( 'touchend', touchEvents.setEnd );
		D_Wrap.removeEventListener( 'touchcancel', touchEvents.setEnd );
		D_Plist.removeEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );

		while( --idx > -1 ){
			// 데이터 마크
			D_List[ idx ].removeAttribute( 'data-swipe-idx' );

			// 포커스시 애니메이션 on/off
			D_List[ idx ].removeEventListener( 'focus', stopSlideShow, false );
			D_List[ idx ].removeEventListener( 'blur', startSlideShow, false );

			// transition event
			D_List[ idx ].removeEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );
		}
	}

	/**
	 * @method: 애니메이션 시작
	 */
	function startSlideShow(){
		if ( is_Slide_Show && slide_Show_Timer === null ){
			slide_Show_Timer = setInterval( toNext, setting.slideShowTime );
		}
	}

	/**
	 * @method: 애니메이션 멈춤
	 */
	function stopSlideShow(){
		clearInterval( slide_Show_Timer );
		slide_Show_Timer = null;
	}

	/**
	 * @method: 화면 리사이즈
	 */
	function refreshSize(){
		list_Width = D_Wrap.offsetWidth;
		cube_Radius = list_Width / 2;

		helper.setCss3( D_Wrap, 'perspective', ( list_Width * 2 ) + 'px' );
	}

	/**
	 * @method: 현재 포지션 얻기
	 */
	function getNowIdx(){
		return now_Idx;
	}

	/**
	 * @method: 현재 포지션 셋팅
	 */
	function setNowIdx( _now_idx ){
		now_Idx = _now_idx;
	}

	/**
	 * @method: 이동할 포지션 얻기
	 */
	function getToIdx(){
		return to_Idx;
	}

	/**
	 * @method: 이동할 포지션 셋팅
	 */
	function setToIdx( _to_idx ){
		to_Idx = _to_idx;
	}

	/**
	 * @method: 이전 인덱스 얻기
	 */
	function getPrevIdx(){
		var idx = getNowIdx();

		if ( --idx < 0 ){
			idx = setting.loop ? list_Len - 1 : -1;
		}

		return idx;
	}

	/**
	 * @method: 다음 인덱스 얻기
	 */
	function getNextIdx(){
		var idx = getNowIdx();

		if ( ++idx > list_Len - 1 ){
			idx = setting.loop ? 0 : -1;
		}

		return idx;
	}

	/**
	 * @method: 이전 슬라이더 이동
	 */
	function toPrev(){
		toSlide( getPrevIdx(), 'prev' );
	}

	/**
	 * @method: 이후 슬라이더 이동
	 */
	function toNext(){
		toSlide( getNextIdx(), 'next' );
	}

	/**
	 * @method: 슬라이더로 이동
	 */
	function toSlide( _to_idx, _way ){
		var now_idx = getNowIdx(),
			gap = _to_idx - now_idx,
			is_direct_access = arguments.length === 1;

		if ( is_Move ){ // 이동중이면 종료
			return false;
		}

		if ( _to_idx === now_idx ){ // 현재 슬라이면 종료
			return false;
		}

		if ( _to_idx < 0 || _to_idx > list_Len - 1 ){ // 범위 초과면 종료
			return false;
		}

		// 루프이면서 길이가 2이면서 다이렉트 접근시 범위 초과이거나 같은 위치일때
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx > 1 || _to_idx % 2 === now_idx % 2 )){
			return false;
		}

		// toSlide 함수를 직접 들어왔을 시
		if ( typeof _way === 'undefined' ){ 
			_way = gap > 0 ? 'next' : 'prev';
		} else {
			if ( Math.abs( gap ) === list_Len - 1 ){ // toNext, toPrev일때 끝에서 끝 이동
				gap = 1;
			}
		}

		// 방향 교정
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx % 2 === 1 && now_idx % 2 === 0 )){
			_way = 'next';
		}

		setToIdx( _to_idx );
		toSlideAnimateBefore();
		toSlideAnimate( setting.duration, _way );
	}

	/**
	 * @method: 슬라이더 애니메이션 이전
	 */
	function toSlideAnimateBefore(){
		var now_idx = getNowIdx(),
			to_idx = getToIdx(),
			i = list_Len;

		setAnimateBefore();

		if ( typeof setting.before === 'function' ){
			setting.before( is_Loop_Len_2 ? now_idx % 2 : now_idx );
		}
	}

	// TODO, 알고리즘 테스트
	/**
	 * @method: 슬라이더 애니메이션
	 */
	function toSlideAnimate( _time, _way ){
		var now_idx = getNowIdx(),
			to_idx = getToIdx(),
			now_pos = helper.getCss3TransformPos( D_List[ now_idx ] );

		// TODO,
		// touch 혹은 애니메이션 접근시
		// 사용자가 빠르게 터치해서 이미 끝으로 도달 했을 시
		if ( now_pos % BASE_DISTANCE === 0 ){
			toSlideAnimateAfter({
				target: D_List[ now_idx ]
			});
		} else {
			// swipe 탄력적으로
			// 거리:전체거리 = 남은거리(x):전체시간 -> 거리 * 전체시간 / 전체거리
			_time = _time * ( BASE_DISTANCE - Math.abs( now_pos ) ) / BASE_DISTANCE;

			helper.setCss3Transition( D_List[ now_idx ], _time, _way === 'next' ? -90 : 90 );
			helper.setCss3Transition( D_List[ to_idx ], _time, 0 );	
		}
	}

	// TODO: 알고리즘 테스트
	/**
	 * @method: 슬라이더 애니메이션 이후
	 */
	function toSlideAnimateAfter( e ){
		var now_idx = getNowIdx(),
			to_idx = getToIdx(),
			prev_idx = 0,
			next_idx = 0,
			i = list_Len;

		setNowIdx( to_idx );
		prev_idx = getPrevIdx();
		next_idx = getNextIdx();

		list_Angle_Arr[ now_idx ] = now_idx < to_idx ? -BASE_ROTATE : BASE_ROTATE;
		list_Angle_Arr[ to_idx ] = 0;

		helper.setCss3Transition( D_List[ now_idx ], 0, list_Angle_Arr[ now_idx ] );
		helper.setCss3Transition( D_List[ to_idx ], 0, list_Angle_Arr[ to_idx ] );

		if ( prev_idx !== -1 ){
			list_Angle_Arr[ prev_idx ] = -BASE_ROTATE;
			helper.setCss3Transition( D_List[ prev_idx ], 0, list_Angle_Arr[ prev_idx ] );
		}

		if ( next_idx !== -1 ){
			list_Angle_Arr[ next_idx ] = BASE_ROTATE;
			helper.setCss3Transition( D_List[ next_idx ], 0, list_Angle_Arr[ next_idx ] );
		}

		now_idx = getNowIdx();

		setAnimateAfter();

		if ( typeof setting.active === 'function' ){
			setting.active( is_Loop_Len_2 ? now_idx % 2 : now_idx );
		}
	}

	/**
	 * 애니메이션 이전
	 */
	function setAnimateBefore(){
		is_Move = true;
		stopSlideShow();
	}

	/**
	 * 애니메이션 이후
	 */
	function setAnimateAfter(){
		is_Move = false;
		startSlideShow();
	}

	if ( constructor()){

		return {
			startSlideShow: startSlideShow,
			stopSlideShow: stopSlideShow,
			refreshSize: refreshSize,
			getIdx: getNowIdx,
			toNext: toNext,
			toPrev: toPrev,
			toSlide: toSlide,
			destory: destory
		};
	}
}