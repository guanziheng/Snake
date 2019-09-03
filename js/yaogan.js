//定义基本常量
var bigR = $("#dipan").width() / 2 //大圆半径//50
var bigLeft = $("#dipan").offset().left; //大圆的left值//50
var bigTop = $("#dipan").offset().top; //大圆的top值//650
var smallR = $("#xuanfuqiu").width() / 2 //小圆半径//20
var bigX = bigR + bigLeft; //大圆圆心横坐标//100
var bigY = bigR + bigTop; //大圆圆心纵坐标//700
var mediumR = bigR - smallR; //小圆圆心到大圆圆心距离//30

//手机判断函数
function isMobile() {
	var userAgentInfo = navigator.userAgent;
	var mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
	var mobile_flag = false;

	//根据userAgent判断是否是手机
	for (var v = 0; v < mobileAgents.length; v++) {
		if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
			mobile_flag = true;
			break;
		}
	}
	var screen_width = window.screen.width;
	var screen_height = window.screen.height;

	//根据屏幕分辨率判断是否是手机
	if (screen_width < 500 && screen_height < 800) {
		mobile_flag = true;
	}

	return mobile_flag;
}

if (isMobile()) {
	//移动端控制
	$('#xuanfuqiu').on('touchstart', function(e) {
		var positionDiv = $(this).offset();
		var distenceX = e.originalEvent.changedTouches[0].pageX - positionDiv.left; //鼠标在小球上的相对横坐标
		var distenceY = e.originalEvent.changedTouches[0].pageY - positionDiv.top; //鼠标在小球上的相对纵坐标
		//console.log("手机");
		try {
			mousedownFunc();//鼠标或手指按下时开始执行的函数
		} catch (e) {
			console.log("没有设置mousedownFunc函数");
		}

		$(document).on('touchmove', function(e) {
			var ballx = e.originalEvent.changedTouches[0].pageX - distenceX + smallR; //小圆圆心横坐标
			var bally = e.originalEvent.changedTouches[0].pageY - distenceY + smallR; //小圆圆心纵坐标
			var ballLeft, ballTop; //小球偏移值
			var ballvalue = ballCalculation(ballx, bally); //调用小球数值计算函数
			ballLeft = ballvalue["ballLeft"];
			ballTop = ballvalue["ballTop"];
			pianyizhi(ballLeft, ballTop); //设置小球偏移值
			try {
				mousemoveFunc(ballvalue);//鼠标或手指按下后移动时执行的函数
			} catch (e) {
				console.log("没有设置mousemoveFunc函数");
			}
		});

		//鼠标松开小球回到原位,速度归零
		$(document).on('touchend', function() {
			$(document).off('touchmove');
			pianyizhi(mediumR, mediumR); //设置小球偏移值
			try {
				mouseupFunc();//鼠标或手指松开后执行的函数
			} catch (e) {
				console.log("没有设置mouseupFunc函数");
			}
		});
	});
} else {
	//PC端控制
	$('#xuanfuqiu').mousedown(function(e) {
		var positionDiv = $(this).offset();
		var distenceX = e.pageX - positionDiv.left; //鼠标在小球上的相对横坐标
		var distenceY = e.pageY - positionDiv.top; //鼠标在小球上的相对纵坐标
		//console.log("pc");
		try {
			mousedownFunc();//鼠标或手指按下时开始执行的函数
		} catch (e) {
			console.log("没有设置mousedownFunc函数");
		}

		$(document).mousemove(function(e) {
			var ballx = e.pageX - distenceX + smallR; //小圆圆心横坐标
			var bally = e.pageY - distenceY + smallR; //小圆圆心纵坐标
			var ballLeft, ballTop; //小球偏移值
			var ballvalue = ballCalculation(ballx, bally); //调用小球数值计算函数
			ballLeft = ballvalue["ballLeft"];
			ballTop = ballvalue["ballTop"];
			pianyizhi(ballLeft, ballTop); //设置小球偏移值
			try {
				mousemoveFunc(ballvalue);//鼠标或手指按下后移动时执行的函数
			} catch (e) {
				console.log("没有设置mousemoveFunc函数");
			}
		});

		//鼠标松开小球回到原位,速度归零
		$(document).mouseup(function() {
			$(document).off('mousemove');
			pianyizhi(mediumR, mediumR); //设置小球偏移值
			try {
				mouseupFunc();//鼠标或手指松开后执行的函数
			} catch (e) {
				console.log("没有设置mouseupFunc函数");
			}
		});
	});
}

//小球数值计算函数
function ballCalculation(ballx, bally) {
	var pingfanghe = (bigX - ballx) * (bigX - ballx) + (bigY - bally) * (bigY - bally) //两圆心平方和
	var zhixianjuli = Math.sqrt(pingfanghe); //两个圆心的直线距离
	var ballLeft, ballTop; //小球偏移值
	var sinA = 0,
		cosA = 0;
	var direction;//当前方向
	//小圆超出大圆范围
	if (pingfanghe > mediumR * mediumR) {
		ballx = Math.floor((ballx - bigX) / zhixianjuli * mediumR); //此处求得的是以大圆圆心为0点建立的坐标轴的小圆圆心的x坐标
		bally = Math.floor((bally - bigY) / zhixianjuli * mediumR); //此处求得的是以大圆圆心为0点建立的坐标轴的小圆圆心的y坐标
		//console.log("圆心坐标x:"+ballx+"y:"+bally);
		ballLeft = ballx + mediumR; //left偏移值校正
		ballTop = bally + mediumR; //top偏移值校正
	}
	//未超出大圆范围,这里的坐标轴以网页为基准,因此偏移值的校正用另一套数据
	else {
		ballLeft = ballx - (bigLeft + smallR); //left偏移值校正//70
		ballTop = bally - (bigTop + smallR); //top偏移值校正//670
	}
	ballx = ballLeft - mediumR; //此处求得的是以大圆圆心为0点建立的坐标轴的小圆圆心的x坐标
	bally = ballTop - mediumR; //此处求得的是以大圆圆心为0点建立的坐标轴的小圆圆心的y坐标

	pingfanghe = ballx * ballx + bally * bally;
	zhixianjuli = Math.sqrt(pingfanghe);
	if (zhixianjuli != 0) {
		sinA = (bally / zhixianjuli).toFixed(1); //小球圆心与0点连接的直线与x轴的夹角的sin值
		cosA = (ballx / zhixianjuli).toFixed(1); //小球圆心与0点连接的直线与x轴的夹角的cos值
	}
	zhixianjuli = Math.floor(zhixianjuli);
	
	direction=thisDirection(ballx,bally);//调用方向判断函数判断当前小球方向

	var ballvalue = {
		"ballX": ballx, //小球圆心x坐标(以大圆圆心为0点)
		"ballY": bally, //小球圆心y坐标(以大圆圆心为0点)
		"ballLeft": ballLeft, //小球left偏移值
		"ballTop": ballTop, //小球top偏移值
		"sin": sinA, //小球圆心与0点连接的直线与x轴的夹角的sin值
		"cos": cosA, //小球圆心与0点连接的直线与x轴的夹角的cos值
		"ballRange": zhixianjuli,//小球的活动范围,即小球圆心到0点的距离
		"direction":direction//小球当前的方向位置(0原点、1上、2下、3左、4右)
	};
	return ballvalue;
}

//设置小球偏移值
function pianyizhi(cssLeft, cssTop) {
	$('#xuanfuqiu').css({
		'left': cssLeft + 'px',
		'top': cssTop + 'px'
	});
}

//加法函数，避免小数相加精度差
function accAdd(arg1, arg2) {
	var r1, r2, m;
	try {
		r1 = arg1.toString().split(".")[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split(".")[1].length
	} catch (e) {
		r2 = 0
	}
	m = Math.pow(10, Math.max(r1, r2))
	return (arg1 * m + arg2 * m) / m
}

//方向判断函数，返回值0原点，1上，2下，3左，4右
function thisDirection(ballx, bally){
	var direction=0;
	if (ballx == 0) {
		if (bally == 0) {
			//原点
			direction=0;
		}
	} else if (ballx > 0) {
		if (bally > -ballx && bally <= ballx) {
			//右
			direction=4;
		} else if (bally > ballx) {
			//下
			direction=2;
		} else {
			//上
			direction=1;
		}
	} else {
		if (bally > ballx && bally <= -ballx) {
			//左
			direction=3;
		} else if (bally > -ballx) {
			//下
			direction=2;
		} else {
			//上
			direction=1;
		}
	}
	return direction;
}