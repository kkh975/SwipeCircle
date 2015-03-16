/*!*
 * 슬라이더 플러그인
 *
 * @autor Blim - Koo Chi Hoon(kkh975@naver.com)
 * @descript: 좌/우 이동, 무한 루프 여부
 */
( function( $ ) {

	'use strict';

	/**
	 * @method: 슬라이더 플러그인
	 */
	$.fn.slideCircleSwipe = function( option ) {
		option.$list   = option.$list ? option.$list : $( this ).find( '> ul > li' );
		option.$wrap   = option.$wrap ? option.$wrap : $( this ).find( '> ul' );
		option.list    = option.$list ? option.$list.toArray( ) : [];
		option.wrap    = option.$wrap ? option.$wrap.toArray( ) : [];
		option.pages   = option.$pages ? option.$pages.toArray( ) : [];
		option.toStart = option.$toStart ? option.$toStart.toArray( ) : [];
		option.toStop  = option.$toStop ? option.$toStop.toArray( ) : [];
		option.toPrev  = option.$toPrev ? option.$toPrev.toArray( ) : [];
		option.toNext  = option.$toNext ? option.$toNext.toArray( ) : [];

		return this.each( function( ) {
			$( this ).data( 'scs', new slideCircleSwipe( option ) );
		} );
	};

	/**
	 * @method: 슬라이더쇼 시작 플러그인
	 */
	$.fn.slideCircleSwipe2start = function( ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).startSlideShow( );
		} );
	};

	/**
	 * @method: 슬라이더쇼 정지 플러그인
	 */
	$.fn.slideCircleSwipe2stop = function( ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).stopSlideShow( );
		} );
	};

	/**
	 * @method: 이전 슬라이더 이동 플러그인
	 */
	$.fn.slideCircleSwipe2prev = function( ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).toPrev( );
		} );
	};

	/**
	 * @method: 다음 슬라이더 이동 플러그인
	 */
	$.fn.slideCircleSwipe2next = function( ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).toNext( );
		} );
	};

	/**
	 * @method: 특정 슬라이더 이동 플러그인
	 */
	$.fn.slideCircleSwipe2next = function( _idx ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).toSlide( _idx );
		} );
	};

	/**
	 * @method: 슬라이더 업데이트
	 */
	$.fn.slideSwipe2update = function( _$list ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).update( _$list.toArray( ) );
		} );
	};

	/**s
	 * @method: 슬라이드 제거
	 */
	$.fn.slideSwipe2destory = function( _idx ) {
		return this.each( function( ) {
			$( this ).data( 'scs' ).destory( );
		} );
	};
}( jQuery ) );

/**
 * @method: 레이어팝업 함수
 */
function slideCircleSwipe( __setting ) {

	'use strict';

	var TRANSITIONENDEVENT_VENDORS = [
			'transitionEnd',
			'transitionend',
			'otransitionend',
			'oTransitionEnd',
			'webkitTransitionEnd' ],
		ANIMATIONEVENT_VENDORS = [
			'animationEnd',
			'MSAnimationEnd',
			'oanimationEnd',
			'webkitAnimationEnd' ],
		TRANSITION_VENDORS = [
			'',
			'-ms-',
			'-o-',
			'-moz-',
			'-webkit-' ],
		ANIMATION_VENDORS = [
			'',
			'-o-',
			'-moz-',
			'-webkit-' ],
		BASE_VENDORS = [
			'',
			'-ms-',
			'-o-',
			'-moz-',
			'-webkit-' ];

	var setting = null,
		wrap_Dom = null,
		list_P_Dom = null,
		list_Dom = null,
		pages_Dom = null,
		to_Start_Dom = null,
		to_Stop_Dom = null,
		to_Prev_Dom = null,
		to_Next_Dom = null,		
		slide_Show_Timer = null,
		is_Loop_Len_2 = false,
		is_Slide_Show = false,
		is_Slide_Showing = false,
		is_Move = false,
		list_Width = 0,
		list_Len = 0,
		cube_Radius = 0,
		cube_Angle = 0,
		cube_Angle_Arr = [],
		now_Idx = 0,
		browser_Prefix = '';

	var default_Option = {
		list: [],					// require, 리스트
		wrap: [],					// require, 리스트 감싸는 태그
		pages: [],					// 슬라이더 페이징 이동
		toStart: [],				// 애니메이션 시작 버튼
		toStop: [],					// 애니메이션 멈춤 버튼
		toPrev: [],					// 이전 이동 버튼
		toNext: [],					// 다음 이동 버튼
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
		 * jQuery extend 기능
		 */
		extend: function( _target, _object ) {
			var prop = null,
				return_obj = {};

			for( prop in _target ) {
				return_obj[ prop ] = prop in _object ? _object[ prop ] : _target[ prop ];
			}

			return return_obj;
		},

		/**
		 * 배열 여부
		 */
		isArray: function( _arr ) {
			return Object.prototype.toString.call( _arr ) === '[object Array]';
		},

		/**
		 * @method: string trim
		 */
		trim: function( _txt ) {
			return _txt.replace( /(^\s*)|(\s*$)/gi, '' );
		},

		/**
		 * DOM에서 배열변환
		 */
		dom2Array: function( _dom ) {
			return Array.prototype.slice.call( _dom );
		},

		/**
		 * 각도를 radius로 변경
		 */
		getRadius: function( _degree ) {
			return _degree * Math.PI / 180;
		},

		/**
		 * @method: css3의 transition 접미사
		 * @return: {Boolean or String}
		 */
		getTransitionPrefix: function( ) {
			var prefixes_arr = [ 'webkit', 'moz', 'o', 'ms' ],
				tmp_dom = document.createElement( 'div' ),
				i = prefixes_arr.length;
			
			while( --i > -1 ) { // 브라우저별 지원
				if ( prefixes_arr[ i ] + 'Transition' in tmp_dom.style ) {
					return prefixes_arr[ i ];
				}
			}

			if ( 'transition' in tmp_dom.style ) { // 표준 지원
				return prefixes_arr[ i ];
			}

			return false;
		},

		/**
		 * @method: 애니메이션 설정
		 */
		setListTransition: function( _speed, _add_angle, _is_set ) {
			var angle = 0,
				i = 0;

			for ( i = 0; i < list_Len; i++ ) {
				angle = cube_Angle_Arr[ i ];
				angle += _add_angle;
				helper.setCss3Transition( list_Dom[ i ], _speed, angle );

				if ( _is_set) {
					cube_Angle_Arr[ i ] = angle;	
				}
			}
		},

		/**
		 * @method: 애니메이션 설정
		 */
		setCss3Transition: function( _dom, _speed, _angle ) {
			var radian = helper.getRadius( _angle ),
				x_pos = Math.round( Math.sin( radian ) * cube_Radius ),
				z_pos = Math.round( Math.cos( radian ) * cube_Radius );

			helper.setCss3( _dom, 'transition', _speed + 'ms' );
			helper.setCss3( _dom, 'transform', 'translateX(' + x_pos + 'px) translateZ(' + z_pos + 'px)' );
		},

		/**
		 * @method: css3 설정
		 */
		setCss3: function( _dom, _prop, _value ) {
			var this_style = _dom.style,
				first_upper_prop = '';

			first_upper_prop = _prop.substring( 0, 1 ).toUpperCase( );
			first_upper_prop += _prop.substring( 1, _prop.length );

			this_style[ _prop ] = this_style[ browser_Prefix + first_upper_prop ] = _value;
		}, 

		/**
		 * @method: 버튼 이벤트 설정
		 */
		setBtnEvent: function( _doms, _evts, _callback ) {
			var evt_arr = _evts.split( ',' ),
				evt_idx = evt_arr.length,
				idx = _doms.length,
				evt = '';

			while( --evt_idx > -1 ) {
				while( --idx > -1 ) {
					evt = helper.trim( evt_arr[ evt_idx ] );

					( function( __idx ) {
						_doms[ idx ].addEventListener( evt, function( e ) {
							_callback( __idx );
							e.preventDefault( );
						} );
					}( idx ) );
				}
			}
		}
	};

	var helperCss3 = { // css3 보조 함수

		/**
		 * @method: Transit 설정
		 */
		setTransit: function( _dom, _pos, _time ) {
			var arr = TRANSITION_VENDORS,
				idx = arr.length,
				dom_style = _dom.style;

			while( --idx > -1 ) {
				dom_style.setProperty( arr[ idx ] + 'transform', 'translateX('+ _pos + '%)' );
				dom_style.setProperty( arr[ idx ] + 'transition', ( _time ? _time : 0 ) + 'ms' );
			}
		},

		/**
		 * @method: Transit 리스트 설정
		 */
		setTransitList: function( _is_set, _add_pos, _time ) {
			var pos = 0,
				len = 0,
				i = 0;

			for ( i = 0; i < list_Len; i++ ) {
				pos = list_Pos_Arr[ i ];

				if ( _add_pos ) {
					pos += _add_pos;
				}

				if ( _is_set ) {
					list_Pos_Arr[ i ] = pos;
				}

				helperCss3.setTransit( list_Dom[ i ], pos, _time );
			}
		},

		/**
		 * @method: Transit 종료 이벤트
		 */
		setTransitEnd: function( _dom, _callback ) {
			var arr = TRANSITIONENDEVENT_VENDORS,
				idx = arr.length;

			while( --idx > -1 ) {
				_dom.addEventListener( arr[ idx ], _callback, false );
			}
		},

		/**
		 * @method: Transit 종료 이벤트 제거
		 */
		removeTransitEnd: function( _dom, _callback ) {
			var arr = TRANSITIONENDEVENT_VENDORS,
				idx = arr.length;

			while( --idx > -1 ) {
				_dom.removeEventListener( arr[ idx ], _callback, false );
			}
		},

		/**
		 * @method: 보통 css3 설정
		 */
		setCommonRule: function( _dom, _prop, _value, _vendors ) {
			var dom_style = _dom.style,
				arr = null,
				idx = 0;

			if ( _vendors ) {
				arr = _vendors;
				idx = arr.length;
				dom_style = _dom.style;

				while( --idx > -1 ) {
					dom_style.setProperty( arr[ idx ] + _prop, _value );
				}
			} else {
				dom_style.setProperty( _prop, _value );				
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
		setInitVaiable: function( ) {
			touchEvents.is_touch_start = false;
			touchEvents.touch_start_x = 0;
			touchEvents.touch_start_y = 0;
			touchEvents.move_dx = 0;
		},

		/**
		 * @method: 터치 시작 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setStart: function( e ) {

			if ( touchEvents.is_touch_start || is_Move ) {
				return false;
			}

			setMoveBefore( );

			if ( !touchEvents.is_touch_start && e.type === 'touchstart' && e.touches.length === 1 ) {
				touchEvents.is_touch_start = true;
				touchEvents.touch_start_x = e.touches[ 0 ].pageX;
				touchEvents.touch_start_y = e.touches[ 0 ].pageY;
			}
		},

		/**
		 * @method: 터치 중 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setMove: function( e ) {
			var drag_dist = 0,
				scroll_dist = 0,
				len = 0,
				i = 0;

			if ( touchEvents.is_touch_start && e.type === 'touchmove' && e.touches.length === 1 ) {
				drag_dist = e.touches[ 0 ].pageX - touchEvents.touch_start_x;	// 가로 이동 거리
				scroll_dist = e.touches[ 0 ].pageY - touchEvents.touch_start_y;	// 세로 이동 거리
				touchEvents.move_dx = ( drag_dist / list_Width ) * 100;			// 가로 이동 백분률

				if ( Math.abs( drag_dist ) > Math.abs( scroll_dist ) ) { // 드래그길이가 스크롤길이 보다 클때
					helper.setListTransition( 0, touchEvents.move_dx );
					e.preventDefault( );
				}
			}
		},

		/**
		 * @method: 터치 완료 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setEnd: function( e ) {
			var over_touch = Math.abs( touchEvents.move_dx ) > setting.touchMinumRange,
				is_to_next = touchEvents.move_dx < 0,
				can_move = is_to_next ? canNextMove( ) : canPrevMove( ),
				time = 0;

			if ( touchEvents.is_touch_start && e.type === 'touchend' && e.touches.length === 0 ) {

				if ( over_touch && can_move ) {
					time = Math.floor( ( touchEvents.move_dx / 100 ) * setting.duration );
					time = setting.duration - Math.abs( time );
					time = Math.max( 0, Math.min( setting.duration, time ) );

					// TODO
				} else { 
					helper.setListTransition( setting.duration, 0 );
				}
				
				touchEvents.setInitVaiable( );
				e.preventDefault( );
			}
		}
	};

	/**
	 * @method: 지원하나?
	 */
	function isSupport( ) {
		var tmp_dom = null;

		if ( typeof window.addEventListener !== 'function' ) {
			return false;
		}

		return true;
	}

	/**
	 * @method: 생성자
	 */
	function constructor( ) {
		var tmp_dom = null,
			evt_arr = [],
			evt_idx = 0,
			idx = 0,
			evt = '';

		setting = helper.extend( default_Option, __setting );
		list_Dom = helper.isArray( setting.list ) ? helper.dom2Array( setting.list ) : setting.list;
		pages_Dom = helper.isArray( setting.pages ) ? helper.dom2Array( setting.pages ) : setting.pages;
		to_Start_Dom = helper.isArray( setting.toStart ) ? helper.dom2Array( setting.toStart ) : setting.toStart;
		to_Stop_Dom = helper.isArray( setting.toStop ) ? helper.dom2Array( setting.toStop ) : setting.toStop;
		to_Prev_Dom = helper.isArray( setting.toPrev ) ? helper.dom2Array( setting.toPrev ) : setting.toPrev;
		to_Next_Dom = helper.isArray( setting.toNext ) ? helper.dom2Array( setting.toNext ) : setting.toNext;

		list_Len = list_Dom.length;
		list_P_Dom = list_Dom[ 0 ].parentNode;
		wrap_Dom = list_P_Dom.parentNode;
		browser_Prefix = helper.getTransitionPrefix( );
		setting.touchMinumRange = Math.max( 1, Math.min( 100, setting.touchMinumRange ) );

		if ( list_Len <= 1 ) { // list이거나, 리스트가 1이하이면 함수 종료
			return false;
		}

		if ( setting.slideShowTime ) { // 슬라이드쇼 옵션 존재
			if ( typeof setting.slideShowTime === 'boolean' ) {
				is_Slide_Show = setting.slideShowTime;

				if ( is_Slide_Show ) { // true일때, 숫자값 대입
					setting.slideShowTime = 3000;
				}
			}

			if ( typeof setting.slideShowTime === 'string' ) {
				setting.slideShowTime = parseInt( setting.slideShowTime, 10 );
			}

			if ( isNaN( setting.slideShowTime ) ) { // 타입이 숫자가 아니면
				is_Slide_Show = false;
			} else {
				is_Slide_Show = true;

				if ( setting.duration * 2 >= setting.slideShowTime ) { // 슬라이드쇼가 애니메이션 시간보다 짧을때
					setting.slideShowTime = setting.duration * 2;
				}
			}
		}

		if ( to_Start_Dom ) { // 애니메이션 시작 버튼
			helper.setBtnEvent( to_Start_Dom, setting.startEvents, function( ) {
				is_Slide_Showing = true;
				startSlideShow( );
			} );
		}

		if ( to_Stop_Dom ) { // 애니메이션 멈춤 버튼
			helper.setBtnEvent( to_Stop_Dom, setting.stopEvents, function( ) {
				is_Slide_Showing = false;
				stopSlideShow( );
			} );
		}

		if ( to_Prev_Dom ) { // 왼쪽 버튼
			helper.setBtnEvent( to_Prev_Dom, setting.moveEvents, toPrev );
		}

		if ( to_Next_Dom ) { // 오른쪽 버튼
			helper.setBtnEvent( to_Next_Dom, setting.moveEvents, toNext );
		}

		if ( pages_Dom ) { // 페이징 이동
			helper.setBtnEvent( pages_Dom, setting.moveEvents, function( _idx ) {
				toSlide( _idx );
			} );
		}

		if ( list_Len === 2 && setting.loop ) { // 루프이면서 리스트가 두개일때
			tmp_dom = list_Dom[ 0 ].cloneNode( true ); // 처음 노드 복사
			list_Dom.push( tmp_dom );
			list_P_Dom.appendChild( tmp_dom );

			tmp_dom = list_Dom[ 1 ].cloneNode( true ); // 두번째 노드 복사
			list_Dom.push( tmp_dom );
			list_P_Dom.appendChild( tmp_dom );

			is_Loop_Len_2 = true;
			list_Len = 4;
		}

		idx = list_Dom.length;

		window.addEventListener( 'load', setInitStyle, false );
		wrap_Dom.addEventListener( 'touchstart', touchEvents.setStart );
		wrap_Dom.addEventListener( 'touchmove', touchEvents.setMove );
		wrap_Dom.addEventListener( 'touchend', touchEvents.setEnd );
		wrap_Dom.addEventListener( 'touchcancel', touchEvents.setEnd );
	}

	/**
	 * @method: 초기화 스타일
	 */
	function setInitStyle( ) {
		var angle = 0,
			radian = 0,
			x_pos = 0,
			z_pos = 0,
			len = 0,
			i = 0;

		list_Width = wrap_Dom.offsetWidth;
		cube_Radius = list_Width / 2;
		cube_Angle = 360 / list_Len;

		wrap_Dom.style.cssText = 'background: #fff; overflow: hidden;';
		helperCss3.setCommonRule( wrap_Dom, 'perspective', ( list_Width * 2 ) + 'px', TRANSITION_VENDORS );

		list_P_Dom.style.cssText = 'position: relative; width: 100%; height: 100%; ';
		helperCss3.setCommonRule( list_P_Dom, 'transform-style', 'preserve-3d' , TRANSITION_VENDORS );
		helperCss3.setCommonRule( list_P_Dom, 'transform', 'scale(0.75)' , TRANSITION_VENDORS );

		for ( i = 0, len = list_Len; i < len; i++ ) {
			angle = cube_Angle * i;
			radian = helper.getRadius( angle );
			x_pos = Math.round( Math.sin( radian ) * cube_Radius );
			z_pos = Math.round( Math.cos( radian ) * cube_Radius );
			cube_Angle_Arr.push( angle );

			list_Dom[ i ].style.cssText = 'position: absolute; width: 100%; height: 100%; ';
			helperCss3.setCommonRule( list_Dom[ i ], 'backface-visibility', 'visible', TRANSITION_VENDORS );
			helperCss3.setCommonRule( list_Dom[ i ], 'transform', 'translateX(' + x_pos + 'px) translateZ(' + z_pos + 'px)', TRANSITION_VENDORS );
			helperCss3.setCommonRule( list_Dom[ i ], 'user-select', 'none', BASE_VENDORS );

			// 이벤트
			list_Dom[ i ].addEventListener( 'focus', stopSlideShow, false );
			list_Dom[ i ].addEventListener( 'blur', startSlideShow, false );
		}

		helperCss3.setTransitEnd( wrap_Dom, setMoveAfter );
		helperCss3.setTransitSpin( );
		startSlideShow( );

		if ( typeof setting.create === 'function' ) { // 생성 후 콜백
			setting.create( getIdx( ) );
		}
	}

	/**
	 * @method: 애니메이션 시작
	 */
	function startSlideShow( ) {
		if ( is_Slide_Show && slide_Show_Timer === null ) {
			slide_Show_Timer = setInterval( toNext, setting.slideShowTime );
		}
	}

	/**
	 * @method: 애니메이션 멈춤
	 */
	function stopSlideShow( ) {
		clearInterval( slide_Show_Timer );
		slide_Show_Timer = null;
	}

	/**
	 * @method: 화면 리사이즈
	 */
	function refreshSize( ) {
		list_Width = wrap_Dom.offsetWidth;
	}

	/**
	 * @method: 현재 포지션 얻기
	 */
	function getIdx( ) {
		return now_Idx;
	}

	/**
	 * @method: 현재 포지션 셋팅
	 */
	function setIdx( _now_idx ) {

		if ( _idx < 0 ) {
			now_Idx = setting.loop ? list_Len - 1 : now_Idx;
		} else if ( _idx > list_Len - 1 ) {
			now_Idx = setting.loop ? 0 : now_Idx;
		} else {
			now_Idx = _idx;
		}
	}

	/**
	 * @method: 이전 인덱스 얻기
	 */
	function getPrevIdx( ) {
		var idx = getIdx( );

		if ( --idx < 0 ) {
			idx = setting.loop ? list_Len - 1 : -1;
		}

		return idx;
	}

	/**
	 * @method: 다음 인덱스 얻기
	 */
	function getNextIdx( ) {
		var idx = getIdx( );

		if ( ++idx > list_Len - 1 ) {
			idx = setting.loop ? 0 : -1;
		}

		return idx;
	}

	/**
	 * @method: 이전 슬라이더 이동
	 */
	function toPrev( ) {
		toSlide( getPrevIdx( ), 'prev' );
	}

	/**
	 * @method: 이후 슬라이더 이동
	 */
	function toNext( ) {
		toSlide( getNextIdx( ), 'next' );
	}

	/**
	 * @method: 특정 슬라이더로 이동
	 */
	function toSlide( _to_idx, _way ) {
		var now_idx = getIdx( ),
			gap = _to_idx - now_idx,
			is_to_next = _to_idx - now_idx > 0,
			can_move = is_to_next ? canNextMove( ) : canPrevMove( ),
			slide_distance = Math.abs( gap ),
			splite_callback = null,
			splite_time = 0,
			len = 0,
			i = 0;
			
		if ( is_Move ) { // 이동중이면 종료 
			return false;
		}

		if ( _to_idx === now_idx ) { // 현재 슬라이면 종료
			return false;
		}

		if ( _to_idx < 0 || _to_idx > list_Len - 1 ) { // 범위 초과면 종료
			return false;
		}

		// 루프이면서 길이가 2이면서 다이렉트 접근시 범위 초과이거나 같은 위치일때
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx > 1 || _to_idx % 2 === now_idx % 2 ) ) { 
			return false;
		}

		if ( typeof _way === 'undefined' ) { // toSlide 함수를 직접 들어왔을 시
			_way = gap > 0 ? 'next' : 'prev';
		}

		// 방향 교정
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx % 2 === 1 && now_idx % 2 === 0 ) ) { 
			_way = 'next';
		}

		toSlideAnimateBefore( now_idx, _to_idx );

		if ( slide_distance > 1 ) {

			// 시간 분활
			splite_time = Math.floor( _time / slide_distance );
			splite_callback = function( ) {
				if ( --slide_distance > 0 ) {
					toSlideAnimate( _time, _way, splite_callback );
				}
			}

			toSlideAnimate( _way, splite_callback );
			setTimeout( function( ) {
				toSlideAnimateAfter( _to_idx );
			}, _time );
		} else {
			toSlideAnimate( _way );
			setTimeout( function( ) {
				toSlideAnimateAfter( _to_idx );
			}, _time );
		}
	}

	/**
	 * @method: 슬라이더 애니메이션 이전
	 */
	function toSlideAnimateBefore( _now_idx, _to_idx ) {
		setMoveBefore( );

		if ( typeof setting.before === 'function' ) {
			setting.before( is_Loop_Len_2 ? getIdx( ) % 2 : getIdx( ) );
		}
	}

	/** 
	 * @method: 애니메이션
	 */
	function toSlideAnimate( _way, _callback ) {
		helperCss3.setTransitList( _way === 'next' ? -cube_Angle : cube_Angle, true );
	}

	/**
	 * 애니메이션 이전
	 */
	function setMoveBefore( ) {
		is_Move = true;
		stopSlideShow( );
	}

	/**
	 * 애니메이션 이후
	 */
	function setMoveAfter( ) {
		is_Move = false;
		startSlideShow( );

		if ( typeof setting.active === 'function' ) {
			setting.active( is_Len_2 ? getIdx( ) % 2 : getIdx( ) );
		}
	}

	if ( isSupport( ) && constructor( ) ) {

		return {
			startSlideShow: startSlideShow,
			stopSlideShow: stopSlideShow,
			refreshSize: refreshSize,
			getIdx: getIdx,
			toNext: toNext,
			toPrev: toPrev,
			toSlide: toSlide,
			destory: destory
		};
	}
}