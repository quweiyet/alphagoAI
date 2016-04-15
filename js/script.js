var chessModule = {};

(function(chessModule, $, undefined) {

	//判断该谁落子
	var me = true;

	//游戏是否结束
	var over = false;

	//count整个棋盘的赢法数
	var count = 0;

	//定义一个二维数组来记录棋盘某一个交叉点是否有棋子
	var checkBoard = [];

	//赢法数组，用来统计在该棋盘上，每一种赢法(三维数组)
	var winsWay = [];

	//赢法统计数组
	var myWin = [];
	var computerWin = [];

	var color = true;
	var tip = true;


	//初始化checkBoard
	for (var i = 0; i < 15; i++) {
		checkBoard[i] = [];
		for (var j = 0; j < 15; j++) {
			checkBoard[i][j] = 0;
		}
	}

	//初始化winsWay
	for (var i = 0; i < 15; i++) {
		winsWay[i] = [];
		for (var j = 0; j < 15; j++) {
			winsWay[i][j] = [];
		}
	}

	//统计横向棋盘的赢法数((i,j)表示棋盘坐标，z表示该种赢法的情况)
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 11; j++) {
			//winsWay[0][0][0] = true;
			//winsWay[0][1][0] = true;
			//winsWay[0][2][0] = true;
			//winsWay[0][3][0] = true;
			//winsWay[0][4][0] = true;
			for (var z = 0; z < 5; z++) {
				winsWay[i][j + z][count] = true;
			}
			//一次循环完成之后，以(i,j)为坐标的5个点连接为一条线，为一种赢法
			count++;
		}
	}

	//纵向赢法
	for (var i = 0; i < 15; i++) {
		for (var j = 0; j < 11; j++) {
			//winsWay[0][0][0] = true;
			//winsWay[1][0][0] = true;
			//winsWay[2][0][0] = true;
			//winsWay[3][0][0] = true;
			//winsWay[4][0][0] = true;
			for (var z = 0; z < 5; z++) {
				winsWay[j + z][i][count] = true;
			}
			count++;
		}
	}

	//斜向赢法
	for (var i = 0; i < 11; i++) {
		for (var j = 0; j < 11; j++) {
			for (var z = 0; z < 5; z++) {
				winsWay[i + z][j + z][count] = true;
			}
			count++;
		}
	}

	//反斜向赢法
	for (var i = 0; i < 11; i++) {
		for (var j = 14; j > 3; j--) {
			for (var z = 0; z < 5; z++) {
				winsWay[i + z][j - z][count] = true;
			}
			count++;
		}
	}

	//赢法统计数组初始化
	for (var i = 0; i < count; i++) {
		myWin[i] = 0;
		computerWin[i] = 0;
	}


	var myCanvas = document.getElementById('canvas');
	var cxt = myCanvas.getContext('2d');
	cxt.strokeStyle = '#BFBFBF';

	//绘制棋盘线
	var drawChessBoard = function() {

		for (var i = 0; i < 15; i++) {
			//画横线
			cxt.moveTo(20 + 40 * i, 20);
			cxt.lineTo(20 + 40 * i, 580);
			cxt.stroke();

			//画纵线
			cxt.moveTo(20, 20 + 40 * i);
			cxt.lineTo(580, 20 + 40 * i);
			cxt.stroke();
		}
	}

	//绘制水印
	var drawWaterMark = function() {
		var bgImg = new Image();
		bgImg.src = 'images/logo.png';

		//图片加载完成再开始画图，否则会因为图片加载需要耗时，导致图片不能被画在画布上
		bgImg.onload = function() {
			cxt.drawImage(bgImg, 0, 0, 630, 560);

			//图片绘制完成再绘制棋盘线，否则棋盘线出现在水印下边，被遮盖
			drawChessBoard();
		}
	}

	/**
	 *绘制棋子
	 * @param i == x
	 * @param j == y
	 * @param me == 是否玩家下棋
	 */
	var drawChess = function(i, j, me) {
		cxt.beginPath();
		cxt.arc(20 + 40 * i, 20 + 40 * j, 18, 0, 2 * Math.PI);
		cxt.closePath();

		//绘制渐变色的棋子，六个参数分别为开始圆心、半径，结束的圆心、半径。
		var gradient = cxt.createRadialGradient(20 + 40 * i + 2, 20 + 40 * j - 2, 18, 20 + 40 * i + 2, 20 + 40 * j - 2, 0);
		
		if (color) {
			if (me) {
				gradient.addColorStop(0, '#0A0A0A'); //第一个圆的颜色(渐变开始色)
				gradient.addColorStop(1, '#636766'); //第二个圆的颜色(渐变结束色)
			} else {
				gradient.addColorStop(0, '#d1d1d1'); //第一个圆的颜色(渐变开始色)
				gradient.addColorStop(1, '#f9f9f9'); //第二个圆的颜色(渐变结束色)
			}
		}else{
			if (me) {
				gradient.addColorStop(0, '#d1d1d1'); //第一个圆的颜色(渐变开始色)
				gradient.addColorStop(1, '#f9f9f9'); //第二个圆的颜色(渐变结束色)
			} else {				
				gradient.addColorStop(0, '#0A0A0A'); //第一个圆的颜色(渐变开始色)
				gradient.addColorStop(1, '#636766'); //第二个圆的颜色(渐变结束色)
			}
		}

		
		cxt.fillStyle = gradient;
		cxt.fill();
	}

	var bindEvent = function() {

		myCanvas.onclick = function(e) {

			if(tip){
				showAlert('小a说可以选择喜欢的颜色哦!', '优雅白', '神秘黑');
				console.log(color);
				tip = false;
				return;
			}

			if (over) {
				return;
			}
			var x = e.offsetX;
			var y = e.offsetY;

			var i = Math.floor(x / 40);
			var j = Math.floor(y / 40);

			//当前交叉点为空才可以落子
			if (checkBoard[i][j] === 0) {
				drawChess(i, j, me);
				checkBoard[i][j] = 1; //checkBoard不为0表示当前地点有子

				for (var k = 0; k < count; k++) {
					if (winsWay[i][j][k]) { //表示当前赢法存在
						myWin[k]++;
						computerWin[k] = 'null'; //当玩家在该点存在赢法时，电脑即失去该种赢法，设定该值为非法数

						if (myWin[k] === 5) {
							showAlert('You Win!','再来一局');
							over = true;
						}

					}
				}

				// 未结束，换人走棋
				if (!over) {
					me = !me;
					computerChess();
				}
			}
		}
	}

	//计算机
	var computerChess = function() {

		//定义双方分数数组
		var myScore = [];
		var computerScore = [];

		var maxScore = 0;
		var u = 0, v = 0;

		for (var i = 0; i < 15; i++) {
			myScore[i] = [];
			computerScore[i] = [];
			for (var j = 0; j < 15; j++) {
				myScore[i][j] = 0;
				computerScore[i][j] = 0;
			}
		}

		for (var i = 0; i < 15; i++) {
			for (var j = 0; j < 15; j++) {
				if (checkBoard[i][j] === 0) {

					for (var k = 0; k < count; k++) {

						if (winsWay[i][j][k]) {

							if (myWin[k] === 1) { //表示黑棋当前赢法已落有一子
								myScore[i][j] += 100;

							} else if (myWin[k] === 2) { //表示当前赢法已落有两子
								myScore[i][j] += 200;

							} else if (myWin[k] === 3) { //表示当前赢法已落有三子
								myScore[i][j] += 1000;

							} else if (myWin[k] === 4) { //表示当前赢法已落有四子
								myScore[i][j] += 10000;
							}
						}

						if(winsWay[i][j][k]){
							if (computerWin[k] === 1) {
								computerScore[i][j] += 120;

							} else if (computerWin[k] === 2) {
								computerScore[i][j] += 230;

							} else if (computerWin[k] === 3) {
								computerScore[i][j] += 3000;

							} else if (computerWin[k] === 4) {
								computerScore[i][j] += 20000;
							}
						}
					}

					//计算机寻找最佳落子点(在myScore和computerScore中得分最高的点)
					//判断玩家和计算机的分数，如果拦截玩家分数高，则拦截，如果自己走棋分数高，计算机放弃拦截，走一步棋
					if (myScore[i][j] > maxScore) {
						maxScore = myScore[i][j];
						u = i;
						v = j;
					} else if (myScore[i][j] === maxScore) {
						if (computerScore[i][j] > computerScore[u][v]) {
							u = i;
							v = j;
						}
					}

					if (computerScore[i][j] > maxScore) {
						maxScore = computerScore[i][j];
						u = i;
						v = j;
					} else if (computerScore[i][j] === maxScore) {
						if (myScore[i][j] > myScore[u][v]) {
							u = i;
							v = j;
						}
					}
				}
			}
		}
		drawChess(u, v, false); //计算机落子
		checkBoard[u][v] = 2;

		for (var k = 0; k < count; k++) {
			if (winsWay[u][v][k]) {
				computerWin[k]++;
				myWin[k] = 'null';

				if (computerWin[k] === 5) {
					showAlert('小a小赢一局，您要再接再厉哦！','加油');
					over = true;
				}
			}
		}

		if(!over){
			me = !me;
		}
	}


	var showAlert = function(content, btn1, btn2){
		var bgDiv = $('<div class="bg"></div>');
		var mainDiv = $('<div class="content"></div>');
		var tipDiv = $('<h1>提示</h1>');
		var contentDiv = $('<p>' + content + '</p>');

		if (btn2) {
			var btnDiv = $('<div class="button"></div>');
			var btn1 = $('<span>' + btn1 + '</span>');
			var btn2 = $('<span>' + btn2 + '</span>');

			btn1.on('click', function(event) {
				event.preventDefault();
				/* Act on the event */
				console.log('1');
				color = false;
				// bgDiv.remove();
				bgDiv.fadeOut();
			});

			btn2.on('click', function(event) {
				event.preventDefault();
				/* Act on the event */
				console.log('2');
				// bgDiv.remove();
				bgDiv.fadeOut();
				color = true;
			});

			btnDiv.append(btn1);
			btnDiv.append(btn2);
		} else {
			var btnDiv = $('<div class="button">' + btn1 + '</div>');
			btnDiv.on('click', function(event) {
				event.preventDefault();
				/* Act on the event */
				// bgDiv.remove();	
				bgDiv.fadeOut();			
			});
		}

		mainDiv.append(tipDiv);
		mainDiv.append(contentDiv);
		mainDiv.append(btnDiv);
		bgDiv.append(mainDiv);
		$('body').append(bgDiv);
		bgDiv.fadeIn();

	}


	chessModule.drawWaterMark = drawWaterMark,
		chessModule.bindEvent = bindEvent,
		chessModule.showAlert = showAlert


})(chessModule, jQuery);


// document.addEventListener('DOMContentLoaded', function() {
// 	chessModule.drawWaterMark();
// 	chessModule.bindEvent();
// }, false);

$(function() {
	chessModule.drawWaterMark();
	chessModule.bindEvent();
});