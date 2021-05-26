
# 리캡챠란
아래 그림과 같이 비정상 유저를 거르기 위한 장치로 구글에서 제공하는 서비스? 이다. 
https://developers.google.com/recaptcha/docs/versions

# 리캡챠 종류
간단하게 v3 와, v2-checkbox, v2-invisible 형식이 있다. android 형식이 있다고 하나 연관이 없는것 같아 패스   
v2-invisible에 대한 내용 (v2 Invisible reCAPTCHA 조사 및 테스트, https://developers.google.com/recaptcha/docs/invisible )  
v3에 대한 내용 (Google reCAPTCHA v3 조사 및 테스트, https://developers.google.com/recaptcha/docs/v3)  

# 리캡챠 적용 플로우 https://developers.google.com/recaptcha/intro#overview
3개의 리캡챠중 하나를 선택하여 FE에 적용하고,   
서버에서 Verifying을 한다. 

# 전체적인 문제점
기존의 캐릭터 사전생성에 reCAPTCHA v2 - checkbox 형식을 사용하고 있었는데, 이것을 invisible 타입으로 변경 요청이 왔다. (v2 Invisible, v3 적용 작업 일정)  
변경시 제일 큰 문제점이 grecaptcha.execute(); 의 실행완료 시점을 알수 없다는 것이다. 

# grecaptcha.execute() 란
유저가 정상적인 유저인지 비정상적인 유저인지 판단하는 메서드 이다.  
checkbox 형식에서는 유저가 직접 체크박스를 클릭함으로서 유저가 정상적인 유저인지 비정상적인 유저인지 판단하기 시작하지만,  
invisible 형식에서는 FE 개발자가 원하는 시점에 grecaptcha.execute() 을 실행함으로서 유저가 정상적인 유저인지 비정상적인 유저인지 판단 시킨다.   
정상유저로 판단된 경우 (excute() 가 성공적으로 완료 된 경우) grecaptch.getResponse() 메서드로 키를 발급 받을수 있다. (이 키는 서버로 전달하여 Verifying을 진행하게 한다.)  
1) v3 에서는 grecaptcha.execute() 가 유사 프로미스 형태를 반화하여 then과 catch 메서드를 사용할수 있다. (테스트 해봄)  
2) v2 에서는 grecaptcha.execute() 가 then 과 catch 메서드를 포함한 객체를 반환하나 해당 메서드가 정상 동작 하지 않는다. (테스트 해봄)  

# 만들고 싶은 로직
캐릭생성 완료 버튼 클릭 -> execute() 실행 -> execute() 완료 -> recaptcha key 발급 완료 -> 캐릭생성 API 호출하여 생성 캐릭에 대한 정보 및 recaptcha key 서버에 전송  
이라는 로직을 태우고 싶으나, execute()를 완료시점을 잡아 낼수 없다. ( v3는 가능하다. grecaptcha.execute().then() 이 정상 동작 하기때문에 )  
그럼 execute() 완료시점은 어떻게 잡아 낼수 있을까?  
v2 invisible 에서는 처음 reCAPTCHA를 랜더링할때 callback 이라는 파라미터를 통해 execute()가 완료된 후 실행할 함수를 전달 하는 방법을 제공하고 있지만...  
이걸로는 원활한 개발이 힘들다.   
참고로 v2 checkbox 에서는  
유저가 checkbox 클릭 -> ecaptcha key 발급 완료 -> ( 연속되지 않은 로직! 유저는 다른 일을 할수 있다. ) -> 캐릭생성 완료 버튼 클릭 -> 캐릭생성 API 호출하여 생성 캐릭에 대한 정보 및 recaptcha key 서버에 전송  
와 같이 reCAPTCHA 와 캐릭생성 로직이 서로 독립되어 있을수 있어서 문제가 되지 않았다.  
 

# 원활한 개발이 힘들다?
v2 invisible 에서는 처음 reCAPTCHA를 랜더링할때 callback 이라는 파라미터를 통해 execute() 의 콜백 함수를 전달한다고 했는데, 이경우 로직은...  
캐릭생성 API 호출 시점이 캐릭생성 완료 버튼 클릭 이벤트가 아니라, execute() 완료 시점이 된다는 것이다.   
즉, reCAPTCHA를 랜더링할때 callback에 캐릭생성 API 호출을 넣어야 한다는 이야기 인데 문제는 없어보이나 깔끔해 보이지는 않는다. 
왜냐하면 캐릭터 생성페이지가 항상 recaptcha를 사용하는 것이 아니기 때문이다.   

## 1) 결국 : recaptcha를 사용하지 않을때
캐릭생성 완료 버튼 클릭 이벤트 콜백으로 -> 캐릭생성 API 호출을 넣어야 한다. 

## 2) 결국 : recaptcha를 사용할때
캐릭생성 완료 버튼 클릭 이벤트 콜백으로 -> excute() 실행후 -> excute() 콜백 으로 -> 캐릭생성 API 호출을 넣어야 한다. 

## 3) 하지만 하고 싶은건 : recaptcha를 사용하지 않을때
캐릭생성 완료 버튼 클릭 이벤트 콜백으로 -> 캐릭생성 API만 호출하고 싶다.

## 4) 하지만 하고 싶은건 : recaptcha를 사용할때
캐릭생성 완료 버튼 클릭 이벤트 콜백으로 -> excute() 실행후 -> 캐릭생성 API 호출하고 싶다.

# 어떻게든 promise 형태로 풀고 싶은데
안된다. 
```js
/***
 * 문제점: 한번 키를 받고 나서, 시간이 지난후  reset()되면 await promise 가 동작하지 않고(이미 처음에 fullfiled 되었으니) getResponse를 바로 실행해버린다
 * 렌더를 중복해서 할수 없다
 */
var promise; // key 값을 resolve 하는 promise
var firstCaptchaKey;  // 처음받은 키값. 이 값의 의미는 grecaptcha가 성공적으로 첫 excute 가 되었다는 것을 의미. 2분뒤면 키 만료
var captchaKey;


var test = function(){
	promise = new Promise((res, rej)=>[
		grecaptcha.render('test', {
			sitekey: '6Lehu9waAAAAAIufX7pPosA6jqZ7XZzejag1qRrZ',
			callback: res, // 처음 excute 될때 받은 key 값, promsie 가 처음 fulfilled 되면 끝.
			size:'invisible',
			'expired-callback': () => {
			  grecaptcha.reset();
			},
			'error-callback': rej,
		})
	])
};

test(); // 참고 : 한번만 실행 됨. 

async function execute(){
	grecaptcha.execute(); 
	firstKey = await promise;
	captchaKey = grecaptcha.getResponse();

	return captchaKey; 
}

async function go(){
	await execute();
	console.log(captchaKey)
}


/**
 * 문제점: 처음 실행시 promise 변수가 undefined 된다. 
 * 2분이 지나 reset 된 후에도 promise 변수가 undefined 된다.
 */
var promise ;
var key;

async function go(){
	grecaptcha.execute();
	var a = await promise; // 처음 실행시 promise 변수가 undefined 된다.
	console.log(a)
}
function setPromise(key){
	promise = new Promise(res=>{
		res(key)
	})
}

var test = function(){

	grecaptcha.render('test', {
		sitekey: '6Lehu9waAAAAAIufX7pPosA6jqZ7XZzejag1qRrZ',
		callback: setPromise, // 처음 excute 될때 받은 key 값, promsie 가 처음 fulfilled 되면 끝.
		size:'invisible',
		'expired-callback': () => {
			grecaptcha.reset();
		},
		// 'error-callback': rej,
	})

};
test();
go()


/***
 * 문제점: 유저가 그림찾기 하고 있으면 타임아웃 걸림
 * 그럼 타임아웃을 무한대로 걸면 될거 같은데
 * 뭔가 애러를 처리 할수 없다는 느낌이 들어 깔끔 하지 않음
 * 그냥 이걸로 할까?
 */
async function go(){
	var key = await execute();
	console.log(key)
}

function getError(e){
	console.error(e)
}

grecaptcha.render('test', {
	sitekey: '6Lehu9waAAAAAIufX7pPosA6jqZ7XZzejag1qRrZ',
	callback: '', // 처음 excute 될때 받은 key 값, promsie 가 처음 fulfilled 되면 끝.
	size:'invisible',
	'expired-callback': () => {
		grecaptcha.reset();
	},
	'error-callback': getError,
})

async function execute(){
	// execute 실행
	grecaptcha.execute();

	return new Promise((res, rej)=> {
		let startTime = Date.now(); // 시작한 시간

		let interval = setInterval(()=>{
			let key = grecaptcha.getResponse(); // excute가 완료 되지 않으면 key 를 받아 오지 않는다.

			let curTime = Date.now(); // 지난 시간
			if(curTime - startTime > 12000){
				clearInterval(interval);
				rej(new Error('타임아웃!'))
			}
			if(key){
				clearInterval(interval);
				res(key);
			}
		},100);
	})
}

go();


/**
 * 위에거 기준으로 v2 / v3 호환 메서드 만들어 봄
 */
// show captcha
var d = $('<div>');
d.addClass('g-recaptcha');
// d.attr('data-sitekey', '6Lehu9waAAAAAIufX7pPosA6jqZ7XZzejag1qRrZ'); //v2
d.attr('data-sitekey', '6LfZ8twaAAAAANLIQdd0zoTtPScxmn1xGLLi3U06'); //v3
d.attr('data-size', 'invisible');
$('#' + 'test').append(d);

// load google recaptcha js
var googleJS = document.createElement('script');
googleJS.type = 'text/javascript';
googleJS.src = 'https://www.google.com/recaptcha/api.js';
document.body.appendChild(googleJS);


async function execute(){
	return new Promise((res, rej)=> {
		window.grecaptcha.execute().then(key=>{
			// Version 3
			if(key !== null){
				console.log('v3!!');
				res(key);
			// Version 2
			}else{
				let startTime = Date.now(); // 시작한 시간

				let interval = setInterval(()=>{
					let key = window.grecaptcha.getResponse(); // excute가 완료 되지 않으면 key 를 받아 오지 않는다.
		
					let curTime = Date.now(); // 지난 시간
					if(curTime - startTime > 12000){
						clearInterval(interval);
						rej(new Error('구글 리캡챠 v2 타임아웃!'));
					}
					if(key){
						console.log('v2!!');
						res(key);
						clearInterval(interval);
					}
				},100);
			}
		}).catch(err=>rej(err));
	});
}

try{
	var key = await execute();
	console.log(key)
}catch(err){
	console.log(err)
}
```

