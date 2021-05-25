class Recaptchatest {
	constructor(){

	}
	promise(){
		return new Promise(res => res(1))
	}
	render(){

	}

	async excute(){

		window.grecaptcha.excute();


	}
}

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


/**?
 * 
 */
var promise  = new Promise(res=>{})
var key;

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

test(); // 참고 : 한번만 실행 됨. 

// async function execute(){
// 	grecaptcha.execute(); 
// 	key = await promise;
// 	promise  = new Promise(res=>{})

// 	return key; 
// }

async function go(){
	var key = await execute();
	console.log(key)
}

grecaptcha.render('test', {
	sitekey: '6Lehu9waAAAAAIufX7pPosA6jqZ7XZzejag1qRrZ',
	callback: '', // 처음 excute 될때 받은 key 값, promsie 가 처음 fulfilled 되면 끝.
	size:'invisible',
	'expired-callback': () => {
		grecaptcha.reset();
	},
	// 'error-callback': rej,
})

async function execute(){
	grecaptcha.execute();

	return new Promise((res, rej)=> {
		let startTime = Date.now();

		let interval = setInterval(()=>{
		
			let key = grecaptcha.getResponse();
			let curTime = Date.now();
			if(curTime - startTime > 2000){
				clearInterval(interval);
				console.log('타임 아웃!')
				rej(new Error('타임아웃!'))
			}
			if(key){
				clearInterval(interval);
				res(key);
			}
		},100);

	})
}

var a = await execute()
console.log(a)