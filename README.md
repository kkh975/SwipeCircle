BaseSwipe
=========

##Introduce
모바일 사이트에서 많이 사용되어지는 플리킹 플러그인입니다. 자바스크립트와 jQuery 동시에 지원하며 슬라이더의 무한 루프와 페이징 기능등 많이 사용되어지는 기능을 넣었습니다.

##How to Uas
####html
아래와 같이 감싸는 태그와 리스트 태그, 그리고 리스트의 아이템 태그로 작성합니다.
```html
<div class="listWrap">
  <ul class="list">
		<li><div style="background: red;">0</div></li>
		<li><div style="background: brown;">1</div></li>
		<li><div style="background: orange;">2</div></li>
	</ul>
</div>
```

####css
아래와 같이 길이와 높이값을 반드시 기입해야 합니다.
```csss
.listWrap {
	width: 100%;
	height: 100px;
}
.list li {
	width: 100%;
	height: 100px;
}
```

####javascript
jquery 플러그인을 작성할 경우 아래와 같이 작성합니다.
```javascript
$( '.listWrap' ).slideSwipe( );
```

javascript으로 작성할 경우 아래와 같이 작성합니다.
```javascript
new SlideSwipe( {
	wrap: document.querySelectorAll( '.listWrap' )[ 0 ],
	list: document.querySelectorAll( '.listWrap li' ),
} );
```

##method
+ toPrev: 이전 슬라이더 이동
+ toNext: 다음 슬라이더 이동
+ toSlide(index): 지정된 슬라이더 이동
+ destory: 제거
+ getPos: 현재 슬라이더 인덱스
+ startSlideShow: 슬라이더쇼 시작
+ stopSlideShow: 슬라이더쇼 정지

##option

####jquery option
+ $wrap: {jQuery Selector} (default: $( this ).find( 'ul' )) 리스트 감쌈
+ $list: {jQuery Selector} (default: $( this ).find( 'ul li' )) 리스트
+ $pages: {jQuery Selector} (default: null) 슬라이드 이동 버튼
+ $toStart: {jQuery Selector} (default: null) 슬라이드쇼 시작 버튼
+ $toStop: {jQuery Selector} (default: null) 슬라이드쇼 멈춤 버튼
+ $toPrev: {jQuery Selector} (default: null) 이전 이동 버튼
+ $toNext: {jQuery Selector} (default: null) 다음 이동 버튼
						
####javascript option
+ wrap: required {elements} (default: null) 리스트 감쌈
+ list: required {elements} (default: null) 리스트
+ pages: {elements} (default: null) 슬라이드 이동 버튼
+ toStart: {elements} (default: null) 슬라이드쇼 시작 버튼
+ toStop: {elements} (default: null) 슬라이드쇼 멈춤 버튼
+ toPrev: {elements} (default: null) 이전 이동 버튼
+ toNext: {elements} (default: null) 다음 이동 버튼

####common option
+ startEvents: {Array} (default: ['click', 'mouseover']) toStart element 이벤트
+ stopEvents: {Array} (default: ['click', 'mouseover']) toStop element 이벤트
+ moveEvents: {Array} (default: ['click', 'mouseover']) toPrev and toNext element 이벤트
+ pageEvents: {Array} (default: ['click', 'mouseover']) pages element 이벤트
+ touchMinumRange: {Integer} (default:10) 사용자 터치시, 슬라이더로 넘어갈 기준값(백분율)
+ duration: {Integer} (default: 400) 애니메이션 시간
+ loop: {Boolean} (default: true) 루프 여부. false로 설정시 마지막 슬라이드에서 정지
+ slideShowTime: {Boolean or Integer} (default: 3000) 슬라이더쇼 시간
+ create: {Function} 생성시 콜백 함수
+ before: {Function} 슬라이더 이동 전 콜백 함수
+ active: {Function} 슬라이더 이동 후 콜백 함수	
					
					
						
						
