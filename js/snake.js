var rows=40,cols=40;//行、列
var windowWidth=window.innerWidth;
if(window.innerHeight-window.innerWidth<=128){
	windowWidth=window.innerHeight-128;
}
while(windowWidth%5!=0){
	windowWidth-=1;
}
var blockSize=windowWidth/40;
//var blockSize=window.innerWidth/40;
var context;
var snakes=[];
var snakeLength=4;//蛇的起始长度
var snakeColor=['black','white'];//蛇身颜色
var snakeBorderColor='#f66';//蛇身描边颜色
var foodX,foodY;//食物起始坐标
var foodStyle=1;//食物类型
var snakeStyle=1;//蛇的状态
var score=0;//计分器
var buffTime=999;//效果时间记录
var changeTime=999;//果实变质时间标记
var changeOver=100;//果实变质时间最大值，100为5秒
var timerSwitch=true;//定时器开关 true代表开着 false代表关
var timer;
var direction=4;//蛇移动的方向 上1 下2 左3 右4
var gamePause=true;//判断游戏暂停还是开始的布尔值 true代表开始 false代表暂停
var zoomOut=0;//网格向内缩小格数
var wudiSnake=false;//蛇是否为无敌状态 true代表无敌，false代表正常
var eatFoodNum=0;//所吃果实数量
var first_skill_num=0;//第一个技能的点数
var second_skill_num=0;//第二个技能的点数
//var third_skill_num=0;//第三个技能的点数
var third_skill_arry=[];//第三个技能的满足条件数组
//var gameOver=false;//游戏结束的布尔值 true代表结束 false代表未结束

autoSize();
$(window).resize(function(){
	autoSize();
})

//自适应函数
function autoSize(){
	$("#gameCanvas").css("left",(window.innerWidth-windowWidth)/2);
	$("#replay").css("top",windowWidth/2+28).css("left",window.innerWidth/2-32);
	$(".last_score_box").css("top",windowWidth/2-90).css("left",window.innerWidth/2-100);
	$(".score_box").css("top",windowWidth).css("left",(window.innerWidth-windowWidth)/2);
	$(".notice_box").css("top",windowWidth+50).css("left",(window.innerWidth-windowWidth)/2);
	$(".fruit_box").css("top",windowWidth).css("right",(window.innerWidth-windowWidth)/2);
	$(".skill_box").css("top",windowWidth+2).css("left",window.innerWidth/2-80);
	$("#best_score").css("right",(window.innerWidth-windowWidth)/2+10);
	if((window.innerHeight-window.innerWidth)<236){
		$(".box").css("width",260).css("height",54).css("left",window.innerWidth/2-130);
		$("#left").css("top",0).css("left",0);
		$("#up").css("top",0).css("left",52);
		$("#pause").css("top",0).css("left",104);
		$("#down").css("top",0).css("left",156);
		$("#right").css("top",0).css("left",208);
	}else{
		$(".box").css("left",window.innerWidth/2-77);
	}
}


$("#replay").click(function(){
	//window.location.reload();
	$("#replay").css("display","none");
	$(".last_score_box").css("display","none");
	$("#best_score").css("display","none");
	snakes=[];
	snakeColor=['black','white'];
	snakeBorderColor='#f66';
	snakeLength=4;
	foodStyle=1;//食物类型
	snakeStyle=1;//蛇的状态
	score=0;//计分器
	buffTime=999;//效果时间记录
	changeTime=999;//食物变质时间记录
	timerSwitch=true;//定时器开关 true代表开着 false代表关
	direction=4;//蛇移动的方向 上1 下2 左3 右4
	gamePause=true;
	wudiSnake=false;
	zoomOut=0;
	eatFoodNum=0;
	start();
	updataScore();
	$("#fourth_skill .skill_chance").html("0%");
	first_skill_num=0;
	$("#first_skill .skill_chance").html(first_skill_num+"/10");
	$("#first_skill .skill_img").css("background","wheat");
	second_skill_num=0;
	$("#second_skill .skill_chance").html(second_skill_num+"/3");
	$("#second_skill .skill_img").css("background","wheat");
	third_skill_arry=[];
	$("#third_skill .skill_chance").html(third_skill_arry.length+"/16");
	$("#third_skill .skill_img").css("background","wheat");
})
$("body").on("touchstart", function(e) {
    startX = e.changedTouches[0].pageX;
    startY = e.changedTouches[0].pageY;
});
$("body").on("touchend", function(e) {         
    moveEndX = e.changedTouches[0].pageX;
    moveEndY = e.changedTouches[0].pageY;
    var moveX = moveEndX - startX;
    var moveY = moveEndY - startY;
    //左滑
    if (moveX<-30){
    		keyDown(37);
    }
    //右滑
    else if(moveX>30){
        keyDown(39);
    }
    //下滑
    else if(moveY>30){
        keyDown(40);
    }
    //上滑
    else if(moveY<-30){
        keyDown(38);
    }
});
window.onload=function(){
	var canvas=document.getElementById("gameCanvas");
	canvas.width=windowWidth;
	canvas.height=windowWidth;
	canvas.style.background="wheat";
	context=canvas.getContext("2d");
	start();
	clickDown();
	document.onkeydown=function(event){
		var e=event||window.event;
		keyDown(e.keyCode);
	}
}
function start(){
	//初始化蛇身
	initSnake();
	//初始化食物位置
	initFood();
	draw();
	
	timer=setInterval(move,100);
}
//画网格 蛇身 以及食物
function draw(){
	context.clearRect(0,0,window.innerWidth,window.innerWidth);
	//绘制网格
	for(var i=0;i<=rows;i++){
		context.beginPath();
		if(i==zoomOut||i==rows-zoomOut){
			context.strokeStyle="#FF6666";
			context.moveTo(zoomOut*blockSize,i*blockSize);
			context.lineTo((cols-zoomOut)*blockSize,i*blockSize);
		}
		else{
			context.strokeStyle="white";
			context.moveTo(0,i*blockSize);
			context.lineTo(cols*blockSize,i*blockSize);
		}
		context.stroke();
		context.closePath();
	}
	for(var j=0;j<=cols;j++){
		context.beginPath();
		if(j==zoomOut||j==cols-zoomOut){
			context.strokeStyle="#FF6666";
			context.moveTo(j*blockSize,zoomOut*blockSize);
			context.lineTo(j*blockSize,(rows-zoomOut)*blockSize);
		}
		else{
			context.strokeStyle="white";
			context.moveTo(j*blockSize,0);
			context.lineTo(j*blockSize,rows*blockSize);
		}
		context.stroke();
		context.closePath();
	}
	//画蛇身
	for(var g=0;g<snakeLength;g++){
		context.beginPath();
		if(g==snakeLength-1){
			context.fillStyle="#f66";
		}else{
			context.fillStyle=snakeColor[g%2];
		}
		context.fillRect(snakes[g].x,snakes[g].y,blockSize,blockSize);
		context.strokeStyle=snakeBorderColor;
		context.strokeRect(snakes[g].x,snakes[g].y,blockSize,blockSize);
		context.closePath();
	}
	//画食物
	context.beginPath();
	switch(foodStyle){
		//普通果实
		case 1:
		context.fillStyle="aquamarine";
		context.strokeStyle="#acd0ef";
		break;
		//饱腹果实
		case 2:
		context.fillStyle="#ffc342";
		context.strokeStyle="#ff6666";
		break;
		//饥饿果实
		case 3:
		context.fillStyle="#b4ec6c";
		context.strokeStyle="#8bc61a";
		break;
		//加速果实
		case 4:
		context.fillStyle="red";
		context.strokeStyle="#ff6666";
		break;
		//减速果实
		case 5:
		context.fillStyle="#74a8ff";
		context.strokeStyle="#9dde57";
		break;
		//运气果实
		case 6:
		context.fillStyle="#f9fea2";
		context.strokeStyle="#8af356";
		break;
		//厄运果实
		case 7:
		context.fillStyle="#c5c5c5";
		context.strokeStyle="#66e826";
		break;
		//无敌果实
		case 8:
		context.fillStyle="#ffffff";
		context.strokeStyle="#ff6666";
		break;
		//机会果实
		case 20:
		context.fillStyle="pink";
		context.strokeStyle="#ff6666";
		break;
		//反向果实
		case 31:
		context.fillStyle="#b20ca8";
		context.strokeStyle="#bb3bd6";
		break;
		//腐烂果实
		case 32:
		context.fillStyle="#e28a00";
		context.strokeStyle="#80c300";
		break;
		//噩梦果实
		case 33:
		context.fillStyle="#858585";
		context.strokeStyle="#62b539";
		break;
		//恶魔果实
		case 34:
		context.fillStyle="#000000";
		context.strokeStyle="#35c055";
		break;
		//天使果实
		case 35:
		context.fillStyle="#ffffff";
		context.strokeStyle="#78d7ff";
		break;
		//缩小果实
		case 36:
		context.fillStyle="#30ff00";
		context.strokeStyle="#8bc61a";
		break;
		//放大果实
		case 37:
		context.fillStyle="#ff9a49";
		context.strokeStyle="#ff6666";
		break;
		//幸运果实
		case 38:
		context.fillStyle="#fcff11";
		context.strokeStyle="#ff5a00";
		break;
		//隐身果实
		case 39:
		context.fillStyle="wheat";
		context.strokeStyle="#ff6666";
		break;
		//命运果实
		case 50:
		context.fillStyle="#9f1b7b";
		context.strokeStyle="#ffffff";
		break;
		//普通果实
		default:
		context.fillStyle="aquamarine";
		context.strokeStyle="#acd0ef";
	}
//	context.arc(foodX+blockSize/2,foodY+blockSize/2,blockSize/2,0,Math.PI*2,false);
//	context.fill();
//	context.stroke();
	context.fillRect(foodX,foodY,blockSize,blockSize);
	context.strokeRect(foodX,foodY,blockSize,blockSize);
	context.closePath();
}
function initSnake(){
	for(var i=0;i<snakeLength;i++){
		snakes[i]={
			x:(i*blockSize),
			y:0
		}
	}
}
function initFood(){
	if(foodStyle<=30){
		foodX=Math.floor(Math.random()*(cols-2*zoomOut)+zoomOut)*blockSize;
		foodY=Math.floor(Math.random()*(rows-2*zoomOut)+zoomOut)*blockSize;
		foodStyle=Math.floor(Math.random()*20+1);
		//foodStyle=39;
	}
	switch(foodStyle){
		//普通果实
		case 1:
		$("#fruit").html("普通果实");
		changeTime=0;
		break;
		//饱腹果实
		case 2:
		$("#fruit").html("饱腹果实");
		changeTime=0;
		break;
		//饥饿果实
		case 3:
		$("#fruit").html("饥饿果实");
		changeTime=0;
		break;
		//加速果实
		case 4:
		changeTime=0;
		$("#fruit").html("加速果实");
		break;
		//减速果实
		case 5:
		$("#fruit").html("减速果实");
		changeTime=0;
		break;
		//运气果实
		case 6:
		$("#fruit").html("运气果实");
		changeTime=0;
		break;
		//厄运果实
		case 7:
		$("#fruit").html("厄运果实");
		changeTime=0;
		break;
		//无敌果实
		case 8:
		$("#fruit").html("无敌果实");
		changeTime=0;
		break;
		//机会果实
		case 20:
		$("#fruit").html("机会果实");
		changeTime=0;
		break;
		//反向果实
		case 31:
		$("#fruit").html("反向果实");
		break;
		//腐烂果实
		case 32:
		$("#fruit").html("腐烂果实");
		break;
		//噩梦果实
		case 33:
		$("#fruit").html("噩梦果实");
		break;
		//恶魔果实
		case 34:
		$("#fruit").html("恶魔果实");
		break;
		//天使果实
		case 35:
		$("#fruit").html("天使果实");
		break;
		//缩小果实
		case 36:
		$("#fruit").html("缩小果实");
		break;
		//放大果实
		case 37:
		$("#fruit").html("放大果实");
		break;
		//幸运果实
		case 38:
		$("#fruit").html("幸运果实");
		break;
		//隐身果实
		case 39:
		$("#fruit").html("隐身果实");
		break;
		//命运果实
		case 50:
		$("#fruit").html("命运果实");
		break;
		default:
		$("#fruit").html("普通果实");
		changeTime=0;
	}
}
function move(){
	var snakeMove=direction;//蛇的移动方向
	//加速果实、减速果实变质为反向果实
	if(foodStyle==4||foodStyle==5){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			foodStyle=31;
			initFood();
		}
	}
	//厄运果实变质为噩梦果实、恶魔果实、天使果实
	else if(foodStyle==7){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			var changeNum=Math.floor(Math.random()*10+1);
			switch(changeNum){
				//恶魔果实
				case 1:
				foodStyle=34;
				break;
				//天使果实
				case 2:
				foodStyle=35;
				break;
				//噩梦果实
				default:
				foodStyle=33;
			}
			initFood();
		}
	}
	//饱腹果实变质为缩小果实、腐烂果实
	else if(foodStyle==2){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			var changeNum=Math.floor(Math.random()*3+1);
			switch(changeNum){
				//腐烂果实
				case 1:
				foodStyle=32;
				break;
				//缩小果实
				default:
				foodStyle=36;
			}
			initFood();
		}
	}
	//饥饿果实变质为放大果实、腐烂果实
	else if(foodStyle==3){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			var changeNum=Math.floor(Math.random()*3+1);
			switch(changeNum){
				//放大果实
				case 1:
				foodStyle=37;
				break;
				//腐烂果实
				default:
				foodStyle=32;
			}
			initFood();
		}
	}
	//运气果实变质为幸运果实、恶魔果实、天使果实
	else if(foodStyle==6){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			var changeNum=Math.floor(Math.random()*5+1);
			switch(changeNum){
				//恶魔果实
				case 1:
				foodStyle=34;
				break;
				//天使果实
				case 2:
				foodStyle=35;
				break;
				//幸运果实
				default:
				foodStyle=38;
			}
			initFood();
		}
	}
	//无敌果实变质为隐身果实
	else if(foodStyle==8){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			foodStyle=39;
			initFood();
		}
	}
	//机会果实变质为命运果实
	else if(foodStyle==20){
		if(changeTime<changeOver){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			foodStyle=50;
			initFood();
		}
	}
	//普通果实变质为腐烂果实
	else if(foodStyle==1||(foodStyle<30&&foodStyle>=9)){
		if(changeTime<changeOver*2){
			if(snakeStyle==4) changeTime+=1;
			else if(snakeStyle==5) changeTime+=4;
			else changeTime+=2;
		}else{
			foodStyle=32;
			initFood();
		}
	}
	
	//果实效果时间
	if(buffTime<100){
		//加速效果，5秒
		if(snakeStyle==4){
			buffTime+=1;
		}
		//减速效果，5秒
		if(snakeStyle==5){
			buffTime+=4;
		}
		//反向效果，5秒
		if(snakeStyle==31){
			buffTime+=2;
		}
		//无敌效果，5秒
		if(snakeStyle==8){
			buffTime+=2;
		}
		//隐身效果，5秒
		if(snakeStyle==39){
			buffTime+=2;
		}
	}
	//恢复原状
	if(!timerSwitch&&buffTime>=100){
		//console.log("减速或加速效果消失");
		snakeColor=['black','white'];
		snakeBorderColor='#f66';
		snakeStyle=1;
		timerSwitch=true;
		wudiSnake=false;
		clearInterval(timer);
		timer=setInterval(move,100);
	}
	switch(snakeMove){
		//上
		case 1:
		//var offSetY=(snakes[snakeLength-1].y-blockSize+rows*blockSize)%(rows*blockSize);
		var offSetY=snakes[snakeLength-1].y-blockSize;
		if(offSetY<zoomOut*blockSize) offSetY=(rows-1-zoomOut)*blockSize;
		snakes.push({
			x:snakes[snakeLength-1].x,
			y:offSetY
		})
		break;
		//下
		case 2:
		//var offSetY=(snakes[snakeLength-1].y+blockSize)%(rows*blockSize);
		var offSetY=snakes[snakeLength-1].y+blockSize;
		if(offSetY>=(rows-zoomOut)*blockSize) offSetY=zoomOut*blockSize;
		snakes.push({
			x:snakes[snakeLength-1].x,
			y:offSetY
		})
		break;
		//左
		case 3:
		//var offSetX=(snakes[snakeLength-1].x-blockSize+cols*blockSize)%(cols*blockSize);
		var offSetX=snakes[snakeLength-1].x-blockSize;
		if(offSetX<zoomOut*blockSize) offSetX=(cols-1-zoomOut)*blockSize;
		snakes.push({
			x:offSetX,
			y:snakes[snakeLength-1].y
		})
		break;
		//右
		case 4:
		//var offSetX=(snakes[snakeLength-1].x+blockSize)%(cols*blockSize);
		var offSetX=snakes[snakeLength-1].x+blockSize;
		if(offSetX>=(cols-zoomOut)*blockSize) offSetX=zoomOut*blockSize;
		snakes.push({
			x:offSetX,
			y:snakes[snakeLength-1].y
		})
		break;
	}
	//用来判断是否碰撞到自己的身体
	//snakeOver();
	//判断游戏是否结束 如果游戏结束重新加载页面 如果未结束执行if中的内容
	if(!snakeOver()){
		eatFood();
		snakes.shift();//移除数组中的第一条数据
		draw();
	}else{
		var best_score;
		context.clearRect(0,0,window.innerWidth,window.innerWidth);
		clearInterval(timer);
		$("#replay").css("display","block");
		$("#last_score").html(score);
		$(".last_score_box").css("display","block");
		
		if(localStorage.getItem("snake_best_score")==null){
			best_score=0;
		}else{
			best_score=localStorage.getItem("snake_best_score");
		}
		if(score>best_score){
			best_score=score;
			localStorage.setItem("snake_best_score",best_score);
		}
		$("#best_score").html("最高得分："+best_score);
		$("#best_score").css("display","block");
		//window.location.reload();
	}
}
//方向控制函数
function keyDown(obj){
	switch(obj){
		//左
		case 37:
		if(direction==1||direction==2){
			if(snakeStyle==31){
				direction=4;
			}else{
				direction=3;
			}
		}
		break;
		//上
		case 38:
		if(direction==3||direction==4){
			if(snakeStyle==31){
				direction=2;
			}else{
				direction=1;
			}
		}
		break;
		//右
		case 39:
		if(direction==1||direction==2){
			if(snakeStyle==31){
				direction=3;
			}else{
				direction=4;
			}
		}
		break;
		//下
		case 40:
		if(direction==3||direction==4){
			if(snakeStyle==31){
				direction=1;
			}else{
				direction=2;
			}
		}
		break;
		//暂停和开始游戏
		case 32:
		if(gamePause){
			$("#pause img").attr('src',"img/play.png");
			clearInterval(timer);
			gamePause=false;
		}
		else{
			if(snakeStyle==4){
				timer=setInterval(move,50);
			}
			else if(snakeStyle==5){
				timer=setInterval(move,200);
			}
			else{
				timer=setInterval(move,100);
			}
			gamePause=true;
			$("#pause img").attr('src',"img/pause.png");
		}
		break;
		//A键，释放技能逆转乾坤
		case 65:
		if(first_skill_num>=10){
			foodStyle=1;
			initFood();
			first_skill_num=0;
			$("#notice").html("你使用了技能逆转乾坤，随机出现一个新果子");
			$("#first_skill .skill_chance").html(first_skill_num+"/10");
			$("#first_skill .skill_img").css("background","wheat");
		}else{
			$("#notice").html("未满足该技能释放条件");
		}
		break;
		//S键，释放技能仁者无敌
		case 83:
		if(second_skill_num>=3){
			buffTime=0;
			snakeStyle=8;
			timerSwitch=false;
			snakeColor=['white','white'];
			snakeBorderColor='#f66';
			wudiSnake=true;
			second_skill_num=0;
			$("#notice").html("你使用了技能仁者无敌，进入无敌模式");
			$("#second_skill .skill_chance").html(second_skill_num+"/3");
			$("#second_skill .skill_img").css("background","wheat");
		}else{
			$("#notice").html("未满足该技能释放条件");
		}
		break;
		//D键，释放技能天使降临
		case 68:
		if(third_skill_arry.length>=16){
			foodStyle=35;
			initFood();
			third_skill_arry=[];
			$("#notice").html("你使用了技能天使降临，召唤出一个天使果实");
			$("#third_skill .skill_chance").html(third_skill_arry.length+"/16");
			$("#third_skill .skill_img").css("background","wheat");
		}else{
			$("#notice").html("未满足该技能释放条件");
		}
		break;
	}
}
//方向按钮函数
function clickDown(){
	$("#left").click(function(){
		keyDown(37);
	})
	$("#up").click(function(){
		keyDown(38);
	})
	$("#right").click(function(){
		keyDown(39);
	})
	$("#down").click(function(){
		keyDown(40);
	})
	$("#pause").click(function(){
		keyDown(32);
	})
	$("#first_skill").click(function(){
		keyDown(65);
	})
	$("#second_skill").click(function(){
		keyDown(83);
	})
	$("#third_skill").click(function(){
		keyDown(68);
	})
}
function snakeOver(){
	if(!wudiSnake){
		for(var i=0;i<snakeLength-3;i++){
			if(snakes[snakeLength-1].x==snakes[i].x&&snakes[snakeLength-1].y==snakes[i].y){
				//gameOver=true;
				//console.log(i);
				return true;
			}
		}
	}
	return false;
}
function eatFood(){
	switch(foodStyle){
		//普通果实
		case 1:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			initFood();
			score+=1;
			updataScore();
			$("#notice").html("你食用了普通果实，分数加1，长度加1");
			skill_chance_update();
		}
		break;
		//饱腹果实
		case 2:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			var addNum;
			addNum=Math.floor(Math.random()*9)+1;
			for(var i=0;i<addNum;i++){
				snakes.unshift({
					x:snakes[snakeLength-1].x,
					y:snakes[snakeLength-1].y
				})
			}
			snakeLength+=addNum;
			initFood();
			score+=5;
			updataScore();
			$("#notice").html("你食用了饱腹果实，分数加5，长度加"+addNum);
			skill_chance_update();
			tianshijianglin(2);
		}
		break;
		//饥饿果实
		case 3:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			var cutNum=0,randomNum;
			if(snakeLength>3){
				if(snakeLength>10) randomNum=10;
				else randomNum=snakeLength;
				cutNum=Math.floor(Math.random()*(randomNum-1))+1;
				for(var i=0;i<cutNum;i++){
					snakes.shift();
				}
				snakeLength-=cutNum;
			}
			initFood();
			score+=5;
			updataScore();
			$("#notice").html("你食用了饥饿果实，分数加5，长度减"+cutNum);
			skill_chance_update();
			tianshijianglin(3);
		}
		break;
		//加速果实
		case 4:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			clearInterval(timer);
			timer=setInterval(move,50);
			buffTime=0;
			snakeStyle=4;
			timerSwitch=false;
			initFood();
			score+=5;
			updataScore();
			snakeColor=['#ff0000','white'];
			snakeBorderColor='#f66';
			wudiSnake=false;
			$("#notice").html("你食用了加速果实，分数加5，速度加1");
			skill_chance_update();
			tianshijianglin(4);
		}
		break;
		//减速果实
		case 5:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			clearInterval(timer);
			timer=setInterval(move,200);
			buffTime=0;
			snakeStyle=5;
			timerSwitch=false;
			initFood();
			score+=5;
			updataScore();
			wudiSnake=false;
			snakeColor=['#74a8ff','white'];
			snakeBorderColor='#74a8ff';
			$("#notice").html("你食用了减速果实，分数加5，速度减1");
			skill_chance_update();
			tianshijianglin(5);
		}
		break;
		//运气果实
		case 6:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			var addScore=Math.floor(Math.random()*10+1);
			//在数组最前面添加一条数据
			snakes.unshift({
				x:0,
				y:0
			})
			initFood();
			snakeLength+=1;
			score+=addScore;
			updataScore();
			$("#notice").html("你食用了运气果实，分数加"+addScore+"，长度加1");
			skill_chance_update();
			tianshijianglin(6);
		}
		break;
		//厄运果实
		case 7:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			var cutScore=Math.floor(Math.random()*10+1);
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			initFood();
			if(score<=cutScore){
				cutScore=score;
			}
			//化险为夷技能发动
			if(huaxianweiyi()){
				$("#notice").html("化险为夷技能发动，为您守住了"+cutScore+"分");
			}
			else{
				score-=cutScore;
				updataScore();
				$("#notice").html("你食用了厄运果实，分数减"+cutScore+"，长度加1");
			}
			skill_chance_update();
			tianshijianglin(7);
		}
		break;
		//无敌果实
		case 8:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			buffTime=0;
			snakeStyle=8;
			timerSwitch=false;
			initFood();
			score+=5;
			updataScore();
			snakeColor=['white','white'];
			snakeBorderColor='#f66';
			wudiSnake=true;
			$("#notice").html("你食用了无敌果实，分数加5，进入无敌状态");
			skill_chance_update();
			tianshijianglin(8);
		}
		//机会果实
		case 20:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			foodStyle=Math.floor(Math.random()*8)+1;
			eatFood();
		}
		break;
		//反向果实
		case 31:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			score+=5;
			snakeStyle=31;
			foodStyle=1;
			buffTime=0;
			timerSwitch=false;
			updataScore();
			initFood();
			snakeColor=['#b20ca8','white'];
			snakeBorderColor='#b20ca8';
			wudiSnake=false;
			$("#notice").html("你食用了反向果实，分数加5，反向移动");
			skill_chance_update();
			tianshijianglin(31);
		}
		break;
		//腐烂果实
		case 32:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			var cutScore=1;
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			foodStyle=1;
			initFood();
			if(score==0) cutScore=0;
			if(huaxianweiyi()){
				$("#notice").html("化险为夷技能发动，为您守住了"+cutScore+"分");
			}
			else{
				score-=cutScore;
				updataScore();
				$("#notice").html("你食用了腐烂果实，分数减"+cutScore+"，长度加1");
			}
			skill_chance_update();
			tianshijianglin(32);
		}
		break;
		//噩梦果实
		case 33:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			var cutScore=Math.floor(Math.random()*20+1);
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			foodStyle=1;
			initFood();
			if(score<=cutScore){
				cutScore=score;
			}
			if(huaxianweiyi()){
				$("#notice").html("化险为夷技能发动，为您守住了"+cutScore+"分");
			}
			else{
				score-=cutScore;
				updataScore();
				$("#notice").html("你食用了噩梦果实，分数减"+cutScore+"，长度加1");
			}
			skill_chance_update();
			tianshijianglin(33);
		}
		break;
		//恶魔果实
		case 34:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			var cutScore=Math.floor(Math.random()*score);
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			foodStyle=1;
			initFood();
			if(huaxianweiyi()){
				$("#notice").html("化险为夷技能发动，为您守住了"+cutScore+"分");
			}
			else{
				score-=cutScore;
				updataScore();
				$("#notice").html("你食用了恶魔果实，分数减"+cutScore+"，长度加1");
			}
			skill_chance_update();
			tianshijianglin(34);
		}
		break;
		//天使果实
		case 35:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			var addScore=Math.floor(Math.random()*score);
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			foodStyle=1;
			initFood();
			score+=addScore;
			updataScore();
			$("#notice").html("你食用了天使果实，分数加"+addScore+"，长度加1");
			skill_chance_update();
			tianshijianglin(35);
		}
		break;
		//缩小果实
		case 36:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			if(zoomOut<5) zoomOut++;
			foodStyle=1;
			initFood();
			score+=5;
			updataScore();
			$("#notice").html("你食用了缩小果实，分数加5，空间缩减一格");
			skill_chance_update();
			tianshijianglin(36);
		}
		break;
		//放大果实
		case 37:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			if(zoomOut>0) zoomOut--;
			foodStyle=1;
			initFood();
			score+=5;
			updataScore();
			$("#notice").html("你食用了放大果实，分数加5，空间增大一格");
			skill_chance_update();
			tianshijianglin(37);
		}
		break;
		//幸运果实
		case 38:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			var addScore=Math.floor(Math.random()*20+1);
			//在数组最前面添加一条数据
			snakes.unshift({
				x:0,
				y:0
			})
			foodStyle=1;
			initFood();
			snakeLength+=1;
			score+=addScore;
			updataScore();
			$("#notice").html("你食用了幸运果实，分数加"+addScore+"，长度加1");
			skill_chance_update();
			tianshijianglin(38);
		}
		break;
		//隐身果实
		case 39:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			buffTime=0;
			snakeStyle=39;
			timerSwitch=false;
			foodStyle=1;
			initFood();
			score+=5;
			updataScore();
			snakeColor=['wheat','wheat'];
			snakeBorderColor='#eee';
			wudiSnake=false;
			$("#notice").html("你食用了隐身果实，分数加5，进入隐身状态");
			//仁者无敌
			if(second_skill_num<3){
				second_skill_num++;
				$("#second_skill .skill_chance").html(second_skill_num+"/3");
				if(second_skill_num==3) $("#second_skill .skill_img").css("background","#f66");
			}
			skill_chance_update();
			tianshijianglin(39);
		}
		break;
		//命运果实
		case 50:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			foodStyle=Math.floor(Math.random()*9)+31;
			eatFood();
		}
		break;
		//普通果实
		default:
		if(snakes[snakeLength-1].x==foodX&&snakes[snakeLength-1].y==foodY){
			//在数组最前面添加一条数据
			snakes.unshift({
				x:0,
				y:0
			})
			snakeLength+=1;
			initFood();
			score+=1;
			updataScore();
			$("#notice").html("你食用了普通果实，分数加1，长度加1");
			skill_chance_update();
		}
	}
}

function updataScore(){
	$("#score").html(score);
}
//化险为夷技能发动函数
function huaxianweiyi(){
	var skillNum=Math.floor(Math.random()*200+1);
	var skillChance=eatFoodNum;
	if(eatFoodNum>160) skillChance=160;
	if(skillNum<=skillChance) return true;
	return false;
}
function skill_chance_update(){
	//化险为夷
	eatFoodNum++;
	var skillChance=eatFoodNum;
	if(eatFoodNum>160) skillChance=160;
	$("#fourth_skill .skill_chance").html(Math.floor(skillChance/2)+"%");
	
	//逆转乾坤
	if(first_skill_num<10){
		first_skill_num++;
		$("#first_skill .skill_chance").html(first_skill_num+"/10");
		if(first_skill_num==10) $("#first_skill .skill_img").css("background","#f66");
	}
}
function tianshijianglin(foodNum){
	var isPush=true;
	for(var i=0;i<third_skill_arry.length;i++){
		if(foodNum==third_skill_arry[i]) isPush=false;
	}
	if(isPush){
		third_skill_arry.push(foodNum);
		$("#third_skill .skill_chance").html(third_skill_arry.length+"/16");
		if(third_skill_arry.length==16) $("#third_skill .skill_img").css("background","#f66");
	}
}
