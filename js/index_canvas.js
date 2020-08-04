'use strict';

$(function () {
	var allData = [], //所有的数据
		point = [], //需要高亮的数据
		tableData = [], // 整理过后的数组
		arrangementObj = []; // 整理成编排可以排的数据

	var mainWidth = '', //主体的宽度
		mainHeight = ''; //主体的高度

	var thList = '';

	var lineArr = new Array(193); //一共有多少行

	// 设置小格子的宽为 90 高为 30
	// 同时  设置第一个的小格子的宽为50 ,高为30
	var firstGridWidth = 50;
	var gridWidth = 90;
	var gridHeight = 30;
	var mapGridWidth = 2;
	var mapGridHeight = 2;

	var scroll_flag = true; //是否是滚动条滚动的

	var mapX = 0,
		mapY = 0; //小地图移动的位置

	var scrollLeft = 0,
		scrollTop = 0;

	var url = 'http://129.2.1.3/all'; //中间内容的接口数据
	var titleUrl = 'http://129.2.1.4/title'; //左边嘉定外高桥,或其他的接口数据
	var optionsUrl = 'http://129.2.1.4/select'; //选项卡数据接口

	var colors = [
		{
			background: '#FF767A',
			color: ' #fff',
		},
		{
			background: '#AC47EE',
			color: ' #fff',
		},
		{
			background: '#FF693C',
			color: ' #fff',
		},
		{
			background: '#FF5ADC',
			color: ' #fff',
		},
		{
			background: '#FFBF97',
			color: ' #000',
		},
		{
			background: '#9B90EF',
			color: ' #fff',
		},
		{
			background: '#35AFF6',
			color: ' #fff',
		},
		{
			background: '#FF5ADC',
			color: ' #fff',
		},
		{
			background: '#94FCFF',
			color: ' #000',
		},

		{
			background: '#A0FF6E',
			color: ' #000',
		},
		{
			background: '#BAF135',
			color: ' #000',
		},
		{
			background: '#18F652',
			color: ' #000',
		},
		{
			background: '#F6FF83',
			color: ' #000',
		},
		{
			background: '#907E4F',
			color: ' #fff',
		},
		{
			background: '#FFDD27',
			color: ' #000',
		},
	];

	getTitle(); //获取标题

	mouseEnterCanvas();

	// 点击强制刷新按钮
	$('.header_refresh').on('click', function () {
		$('.loading').css('display', 'block');

		$('.header_refresh img').css({
			animation: 'rotate .8s ease-in-out infinite',
			'-webkit-animation': 'rotate .8s ease-in-out infinite',
		});
		// 选中已选中的
		render($('.drop-down option:selected').val());
	});

	// 搜索SG功能
	$('#search_SG_button').on('click', function () {
		var val = $('#search_SG').val().trim().toUpperCase();

		// 获取input框里的值
		if (val) {
			var SGList = allData.filter(function (item) {
				return item.SG === val;
			});

			if (SGList.length === 0) {
				$('#search_SG').val('');

				ContentWhite(); // 绘画中间内容的canvas

				hightLight(allData, point); // 高亮

				mapCanvas(); // map图

				mapLight(allData, point); //map图的高亮

				alert('没有搜索到SG为: "' + val + '" 的内容');

				return;
			}

			// 位移
			moveToByXY(SGList[0].colNum, SGList[0].rowNum);

			searchLight(SGList);

			searchMapLight(SGList);
		} else {
			alert('请输入内容');
		}
	});

	// 搜索SG的重置按钮
	$('.reset_SG').on('click', function () {
		//让搜索SG分布的input框为 空
		$('#search_SG').val('');

		ContentWhite(); // 绘画中间内容的canvas

		hightLight(allData, point); // 高亮

		mapCanvas(); // map图

		mapLight(allData, point); //map图的高亮
	});

	// 显示卷分布的功能
	$('#search_volumeLabel_button').on('click', function () {
		var val = $('#search_volumeLabel').val().trim().toUpperCase();

		if (val) {
			var accordArr = allData.filter(function (m) {
				return m.volumeLabel.indexOf(val) > -1;
			});

			if (accordArr.length === 0) {
				$('#search_volumeLabel').val('');

				ContentWhite(); // 绘画中间内容的canvas

				hightLight(allData, point); // 高亮

				mapCanvas(); // map图

				mapLight(allData, point); //map图的高亮

				alert('没有搜索到含有 "' + val + '" 的卷');

				return;
			}

			moveToByXY(accordArr[0].colNum, accordArr[0].rowNum);

			searchLight(accordArr);

			searchMapLight(accordArr);
		} else {
			alert('请输入内容');
		}
	});

	// 搜索卷分布的重置按钮
	$('.reset_vol').on('click', function () {
		//让搜索SG分布的input框为 空
		$('#search_volumeLabel').val('');

		ContentWhite(); // 绘画中间内容的canvas

		hightLight(allData, point); // 高亮

		mapCanvas(); // map图

		mapLight(allData, point); //map图的高亮
	});

	// 点击显示或隐藏map
	$('.header_map').on('click', function () {
		$('.map_nav').toggleClass('isshow');
	});

	// 点击切换卷的功能
	$('.container_left').on('click', 'li', function () {
		// 点击切换卷了
		$(this).addClass('current').siblings().removeClass('current');

		$('.loading').css('display', 'block');

		getSelect($('.container_left li.current').data('name'));
	});

	// 按下 白色小方块
	$('.pointer').on('mousedown', function (e) {
		e = e || window.event; //事件对象的兼容

		// 1.获取鼠标按下时的位置
		var x = e.clientX; //起始点X的坐标
		var y = e.clientY; //起始点Y的坐标

		var pointMapX = mapX;
		var pointMapY = mapY;

		// 获取滚动条滚动的距离,并且不再实时更新
		document.onmousemove = function (e) {
			e = e || window.event;

			var targetX = e.clientX - x + pointMapX;
			var targetY = e.clientY - y + pointMapY;

			// 这个小框移动的范围
			var minX = 0;
			var maxX = $('.pointer_main').width() - $('.pointer').width();
			var minY = 0;
			var maxY = $('.pointer_main').height() - $('.pointer').height();

			targetX = targetX < minX ? minX : targetX;
			targetX = targetX > maxX ? maxX : targetX;
			targetY = targetY < minY ? minY : targetY;
			targetY = targetY > maxY ? maxY : targetY;

			var contentMoveX = (targetX / mapGridWidth) * gridWidth;
			var contentMoveY = (targetY / mapGridHeight) * gridHeight;

			scrollLeft = contentMoveX;
			scrollTop = contentMoveY;

			// 中间
			$('.content').scrollLeft(contentMoveX);
			$('.content').scrollTop(contentMoveY);

			scroll_flag = false;
		};
	});

	//黑色的 map图
	$('.pointer_main').on('mousedown', function (e) {
		var minX = 0;
		var maxX = $('.pointer_main').width() - $('.pointer').width();
		var minY = 0;
		var maxY = $('.pointer_main').height() - $('.pointer').height();

		var targetX = e.offsetX - $('.pointer').width() / 2;
		var targetY = e.offsetY - $('.pointer').height() / 2;

		targetX = targetX < minX ? minX : targetX;
		targetX = targetX > maxX ? maxX : targetX;
		targetY = targetY < minY ? minY : targetY;
		targetY = targetY > maxY ? maxY : targetY;

		// 换算出content的scrollTop scrollLeft
		var contentMoveX = (targetX / mapGridWidth) * gridWidth;
		var contentMoveY = (targetY / mapGridHeight) * gridHeight;

		// 中间
		$('.content').scrollLeft(contentMoveX);
		$('.content').scrollTop(contentMoveY);

		scrollLeft = contentMoveX;
		scrollTop = contentMoveY;
	});

	// 置为空 (换成document之后每次都会 触发mouseup,如果变成 map_nav, 就会有问题)
	$(document).on('mouseup', function (e) {
		e = e || window.event; //事件对象的兼容

		document.onmousemove = null;

		// 判断是在哪里抬起的是不是是在 pointer_main  pointer
		var _target = $(e.target);

		if (
			_target.hasClass('pointer_main') === false &&
			_target.hasClass('pointer') === false
		) {
			return;
		} else {
			// 在缩略图内鼠标抬起
			scroll_flag = false;
		}
	});

	// .content 的scroll滚动事件
	$('.content').on('scroll', function (e) {
		var top = $(this).scrollTop();
		var left = $(this).scrollLeft();

		$('#col').css({
			transform: 'translateY(-' + top + 'px)',
		});

		$('#row').css({
			transform: 'translateX(-' + left + 'px)',
		});

		if (scroll_flag) {
			//手动拖动了滚动条
			mapX = (left / mainWidth) * $('.pointer_main').width();
			mapY = (top / mainHeight) * $('.pointer_main').height();
		} else {
			//其它原因导致滚动条位置改变
			mapX = (scrollLeft / $('#canvasId').width()) * $('.pointer_main').width();
			mapY =
				(scrollTop / $('#canvasId').height()) * $('.pointer_main').height();
		}

		// pointer的移动位置
		$('.pointer').css({
			transform: 'translate(' + mapX + 'px, ' + mapY + 'px)',
		});

		// 重置開關
		scroll_flag = true;
	});

	// 下拉菜单的change事件
	$('.drop-down').on('change', 'select', function (e) {
		$('.loading').css('display', 'block');

		// 请求
		setTimeout(function () {
			render($('.drop-down option:selected').val());
		}, 1);
	});

	// 点击导出excel
	$('.toexcel').on('click', function () {
		var excelData = toExcelList(tableData, lineArr);

		var titles = tableData.map(function (v) {
			return v.name;
		});

		JsonToExcel(excelData, 'excel', 'sheet', titles);
	});

	window.onresize = windowResize;

	// 通过x,y坐标来移动
	function moveToByXY(x, y) {
		x = +x;
		y = +y;

		scrollLeft = x * gridWidth;
		scrollTop = y * gridHeight;

		// 把content位移
		$('.content').scrollLeft(x * gridWidth);
		$('.content').scrollTop(y * gridHeight);

		// 左边的canvas
		$('#col').css({
			transform: 'translateY(-' + y * gridHeight + 'px)',
		});

		// 位移上面的canvas
		$('#row').css({
			transform: 'translateX(-' + x * gridWidth + 'px)',
		});
	}

	/*
		获取title并且渲染出来
	*/
	function getTitle() {
		$.ajax({
			url: titleUrl,
			type: 'get',
			dataType: 'json',
			success: function (data) {
				// 成功获取数据之后渲染标题
				$('.container_left ul').html(
					template('infoTitle', {
						list: data,
						currentTitle: data[0].name,
					})
				);

				// 获取下拉菜单
				getSelect(data[0].name);
			},
		});
	}

	// 获取select下拉菜单数据
	function getSelect(name) {
		name = name || '';
		$.ajax({
			url: optionsUrl,
			type: 'get',
			data: { name: name },
			dataType: 'json',
			success: function (info) {
				// 渲染下拉菜单
				$('.drop-down select').html(
					template('dropDown', {
						list: info.data,
					})
				);

				// 获取中间的contents数据
				setTimeout(function () {
					render(info.data[0].name); //请求后台数据(给默认值) 默认给第一个数据的第一个值
				}, 1);
			},
		});
	}

	/*
		渲染 
		value传入后台的值,
		flag,是否强制刷新
	 */
	function render(lpar) {
		lpar = lpar || '';

		$.ajax({
			url: url,
			type: 'get',
			data: {
				name: lpar,
			},
			dataType: 'json',
			success: function (info) {
				$('.header_refresh img').css({
					animation: 'none',
				});

				$('.loading').css('display', 'none');

				toRenderContent(info);
			},
			error: function (err) {
				throw err;
			},
		});
	}

	// 渲染内容
	function toRenderContent(info) {
		// 整理过后的data数据
		tableData = initData(info.menus.data);

		allData = info.menus.data;

		point = info.menus.point;

		// th的父集合
		thList = sortTh(info.menus.equipment);

		// 主体的宽度和高度
		mainWidth = tableData.length * 90;
		mainHeight = lineArr.length * 30;

		arrangementObj = arrangementData(info.menus.data);

		colCanvas(); //绘画左边的canvas

		rowCanvas(); //绘画上面的canvas

		ContentWhite(); // 绘画中间内容的canvas

		hightLight(allData, point); // 高亮

		mapCanvas(); // map图

		mapLight(allData, point); //map图的高亮

		$('.container').height($('.box_far').height() - 60 + 'px');
		$('.content').height($('.right').height() - 60 + 'px');
		$('.pointer').height(
			($('.content').height() / mainHeight) * $('.pointer_main').height() + 'px'
		);
		$('.pointer').width(
			($('.content').width() / mainWidth) * $('.pointer_main').width() + 'px'
		);
	}

	// 鼠标移入canvas上的事件
	function mouseEnterCanvas() {
		var cas = document.getElementById('canvasId');

		var ctx = cas.getContext('2d');

		ctx.font = '18px Courier New';

		// 上一步
		var prevX = '';
		var prevY = '';

		$('#canvasId').on('mousemove', function (e) {
			var x = parseInt(e.offsetX / gridWidth);
			var y = parseInt(e.offsetY / gridHeight);

			if (x !== prevX || y !== prevY) {
				//删除之前的dom
				$('#x' + prevX + 'y' + prevY).remove();

				prevX = x;
				prevY = y;

				// 根据传入的x,y来获取数据
				var resultInfo = getInfoByXY(x, y);

				var address = resultInfo ? resultInfo.address : '';
				var volumeLabel = resultInfo ? resultInfo.volumeLabel : '';
				var SG = resultInfo ? resultInfo.SG : '';
				var remain_pct = resultInfo ? resultInfo.remain_pct : '';
				var state = resultInfo ? resultInfo.state : '';
				var VolumeCapacity = resultInfo ? resultInfo.VolumeCapacity : '';

				if (!VolumeCapacity) {
					VolumeCapacity = '未知';
				} else {
					if (/^49/.test(VolumeCapacity)) {
						//54型卷
						VolumeCapacity = '54型卷';
					} else if (/^27/.test(VolumeCapacity)) {
						//27型卷
						VolumeCapacity = '27型卷';
					} else if (/^1/.test(VolumeCapacity)) {
						//1型卷
						VolumeCapacity = '1型卷';
					} else if (/^83/.test(VolumeCapacity)) {
						// 9型卷
						VolumeCapacity = '9型卷';
					} else {
						//未知
						VolumeCapacity = '未知';
					}
				}

				if (x >= tableData.length - 2 && y >= lineArr.length - 8) {
					var div =
						'<div class="info-box" id="x' +
						x +
						'y' +
						y +
						'" style="position:absolute; top:' +
						(e.offsetY - 160) +
						'px;left:' +
						(e.offsetX - 100) +
						'px;"><p>' +
						volumeLabel +
						'</p><p>Address:' +
						address +
						'</p><p>卷类型: ' +
						VolumeCapacity +
						'</p><p>SG:' +
						SG +
						'</p><p>使用率:' +
						remain_pct +
						'%</p><p>state:' +
						state +
						'</p></div>';
				} else if (x >= tableData.length - 2) {
					var div =
						'<div class="info-box" id="x' +
						x +
						'y' +
						y +
						'" style="position:absolute; top:' +
						(e.offsetY + 30) +
						'px;left:' +
						(e.offsetX - 100) +
						'px;"><p>' +
						volumeLabel +
						'</p><p>Address:' +
						address +
						'</p><p>卷类型: ' +
						VolumeCapacity +
						'</p><p>SG:' +
						SG +
						'</p><p>使用率:' +
						remain_pct +
						'%</p><p>state:' +
						state +
						'</p></div>';
				} else if (y >= lineArr.length - 8) {
					var div =
						'<div class="info-box" id="x' +
						x +
						'y' +
						y +
						'" style="position:absolute; top:' +
						(e.offsetY - 160) +
						'px;left:' +
						(e.offsetX + 10) +
						'px;"><p>' +
						volumeLabel +
						'</p><p>Address:' +
						address +
						'</p><p>卷类型: ' +
						VolumeCapacity +
						'</p><p>SG:' +
						SG +
						'</p><p>使用率:' +
						remain_pct +
						'%</p><p>state:' +
						state +
						'</p></div>';
				} else {
					var div =
						'<div class="info-box" id="x' +
						x +
						'y' +
						y +
						'" style="position:absolute; top:' +
						(e.offsetY + 30) +
						'px;left:' +
						(e.offsetX + 10) +
						'px;"><p>' +
						volumeLabel +
						'</p><p>Address:' +
						address +
						'</p><p>卷类型: ' +
						VolumeCapacity +
						'</p><p>SG:' +
						SG +
						'</p><p>使用率:' +
						remain_pct +
						'%</p><p>state:' +
						state +
						'</p></div>';
				}

				// 添加dom
				$('.content').append(div);
			}
		});

		$('#canvasId').on('mouseleave', function (e) {
			//删除之前的dom
			$('#x' + prevX + 'y' + prevY).remove();
		});
	}

	// 画出左边列的图
	function colCanvas() {
		//  1.找到canvas
		var cas = document.getElementById('col');

		var _firstGridWidth = firstGridWidth;

		var _gridHeight = gridHeight;

		// 2.动态设置canvas画布的宽高
		cas.width = _firstGridWidth + ''; // 第一个表格的宽度 + 数组的长度
		cas.height = _gridHeight * (lineArr.length + 2) + '';

		// 3.拿到canvas绘图上下文
		var ctx = cas.getContext('2d');

		ctx.font = '18px Courier New';
		ctx.strokeStyle = '#CCCCCC'; // 轮廓的颜色

		// 4.绘制纵着的坐标
		for (var i = 0, len = lineArr.length; i < len; i++) {
			if (i === 0) {
				ctx.rect(0, 0, _firstGridWidth, _gridHeight);
			} else if (i === 1) {
				ctx.rect(0, 30, _firstGridWidth, _gridHeight);
			}

			if (i + 1 < 10) {
				ctx.rect(0, 60 + _gridHeight * i, _firstGridWidth, _gridHeight);
				ctx.fillText('00' + (i + 1), 8, 60 + _gridHeight * (i + 1) - 8);
			} else if (i + 1 < 100) {
				ctx.rect(0, 60 + _gridHeight * i, _firstGridWidth, _gridHeight);
				ctx.fillText('0' + (i + 1), 8, 60 + _gridHeight * (i + 1) - 8);
			} else {
				ctx.rect(0, 60 + _gridHeight * i, _firstGridWidth, _gridHeight);
				ctx.fillText(i + 1, 8, 60 + _gridHeight * (i + 1) - 8);
			}
		}

		ctx.stroke();
	}

	// 画出上面行的图
	function rowCanvas() {
		//  1.找到canvas
		var cas = document.getElementById('row');

		// 减少读取次数
		var _gridWidth = gridWidth;
		var _gridHeight = gridHeight;

		// 2.动态设置canvas画布的宽高
		cas.width = _gridWidth * tableData.length + ''; // 第一个表格的宽度 + 数组的长度
		cas.height = _gridHeight * 2 + '';

		// 3.拿到canvas绘图上下文
		var ctx = cas.getContext('2d');

		ctx.font = '18px Courier New';
		ctx.strokeStyle = '#CCCCCC'; // 轮廓的颜色

		var length = 0;

		// 绘制第一行横坐标
		thList.forEach(function (item) {
			ctx.rect(length, 0, _gridWidth * item.len, _gridHeight);

			ctx.fillText(
				item.name,
				length + (_gridWidth * item.len) / 2,
				_gridHeight - 8
			);

			length = length + _gridWidth * item.len;
		});

		// 绘制第二行横坐标
		tableData.forEach(function (item, index) {
			ctx.rect(_gridWidth * index, _gridHeight, _gridWidth, _gridHeight);

			ctx.fillText(item.name, _gridWidth * index + 24, _gridHeight * 2 - 8);
		});

		ctx.stroke();
	}

	// 画中间的图
	// 全部置为白色背景
	function ContentWhite() {
		//  1.找到canvas
		var cas = document.getElementById('canvasId');

		var _gridWidth = gridWidth;
		var _gridHeight = gridHeight;

		var tabLen = tableData.length; //列
		var lineLen = lineArr.length; //行

		// 2.动态设置canvas画布的宽高
		cas.width = (_gridWidth * tabLen).toString(); // 第一个表格的宽度 + 数组的长度
		cas.height = (_gridHeight * lineLen).toString();

		// 3.拿到canvas绘图上下文
		var ctx = cas.getContext('2d');

		ctx.font = '18px Courier New';
		ctx.strokeStyle = '#CCCCCC'; // 轮廓的颜色

		// 列
		for (var m = 0; m < tabLen; m++) {
			// 行
			for (var i = 0; i < lineLen; i++) {
				ctx.rect(_gridWidth * m, _gridHeight * i, _gridWidth, _gridHeight);

				ctx.fillStyle = '#fff'; //背景;

				ctx.fillRect(_gridWidth * m, _gridHeight * i, _gridWidth, _gridHeight);

				ctx.fillStyle = '#333';

				if (arrangementObj[i]) {
					if (arrangementObj[i][m]) {
						ctx.fillText(
							arrangementObj[i][m],
							_gridWidth * m + 14,
							_gridHeight * i + 22
						);
					} else {
						ctx.fillText('', _gridWidth * m + 14, _gridHeight * i - 8);
					}
				} else {
					ctx.fillText('', _gridWidth * m + 14, _gridHeight * i - 8);
				}
			}
		}
	}

	// 整理回来的数据 使他变成 {1:{0:bk1111, 1: bk333,2:BK0001}} 属性名 :行 , [] 数组是列
	function arrangementData(arr) {
		var obj = {};

		arr.forEach(function (v) {
			if (obj[v.rowNum]) {
				obj[v.rowNum][v.colNum] = v.volumeLabel;
			} else {
				obj[v.rowNum] = {};
				obj[v.rowNum][v.colNum] = v.volumeLabel;
			}
		});

		return obj;
	}

	// 画地图的概览图
	function mapCanvas() {
		//  1.找到canvas
		var cas = document.getElementById('map_line');

		var _mapGridWidth = mapGridWidth;
		var _mapGridHeight = mapGridHeight;

		var tabLen = tableData.length;
		var lineLen = lineArr.length;

		// 2.动态设置canvas画布的宽高
		cas.width = _mapGridWidth * tabLen + ''; // 第一个表格的宽度 + 数组的长度
		cas.height = _mapGridHeight * lineLen + '';

		// 3.拿到canvas绘图上下文
		var ctx = cas.getContext('2d');

		// 行
		for (var m = 0; m < tabLen; m++) {
			// 列
			for (var i = 0; i < lineLen; i++) {
				ctx.fillRect(
					_mapGridWidth * m,
					_mapGridHeight * i,
					_mapGridWidth,
					_mapGridHeight
				);

				ctx.fillStyle = '#333';
			}
		}
	}

	// map高亮效果
	function mapLight(data, arr) {
		var cas = document.getElementById('map_line');

		// 拿出画笔
		var ctx = cas.getContext('2d');

		arr.forEach(function (a, i) {
			var result = data.filter(function (item) {
				return item.SG === a;
			});

			result.forEach(function (item) {
				ctx.fillRect(
					mapGridWidth * (item.colNum - 0),
					mapGridHeight * (item.rowNum - 0),
					mapGridWidth,
					mapGridHeight
				);

				ctx.fillStyle = colors[i].background; //背景;
			});
		});
	}

	// 将16进制转换成10进制
	function change(sixteen) {
		return parseInt(sixteen, 16);
	}

	// 初始化数据
	function initData(data) {
		// 1.将所有的CU都提出来, 放到同一个数组里面
		var arr = data.map(function (v) {
			return v.CU;
		});

		// 2.数组去重
		var uniqueArr = arr.filter(function (item, i, self) {
			return self.indexOf(item) === i;
		});

		// 3.将数组按照从小到大的顺序排序
		var sortedArr = uniqueArr.sort(function (a, b) {
			return change(a) - change(b);
		});

		// 4.返回整理过后的数组
		return sortedArr.map(function (v) {
			var temp = [];

			data.forEach(function (w) {
				if (w.CU === v) {
					temp.push(w);
				}
			});

			return {
				name: v,
				data: temp,
			};
		});
	}

	//将th的父盒子的名称和长度整理起来
	function sortTh(data) {
		var arr = data.map(function (item) {
			return item.DM;
		});

		var uniqueArr = arr.filter(function (item, i, self) {
			return self.indexOf(item) === i;
		});

		var sortData = [];

		uniqueArr.forEach(function (m) {
			var result = data.filter(function (n) {
				return n.DM === m;
			});

			sortData.push({
				name: m,
				len: result.length,
			});
		});

		return sortData;
	}

	// 根据传入的x,y坐标获取当前的数据
	function getInfoByXY(x, y) {
		return allData.filter(function (item) {
			return item.colNum == x && item.rowNum == y;
		})[0];
	}

	// 默认高亮效果
	function hightLight(data, arr) {
		// 找到当前的dom
		var cas = document.getElementById('canvasId');

		var _gridWidth = gridWidth;
		var _gridHeight = gridHeight;

		// 拿出画笔
		var ctx = cas.getContext('2d');

		ctx.font = '18px Courier New';
		ctx.strokeStyle = '#CCCCCC'; // 轮廓的颜色

		arr.forEach(function (a, i) {
			var result = data.filter(function (item) {
				return item.SG === a;
			});

			result.forEach(function (item) {
				ctx.rect(
					_gridWidth * (item.colNum - 0),
					_gridHeight * (item.rowNum - 0),
					_gridWidth,
					_gridHeight
				);

				ctx.fillStyle = colors[i].background; //背景;

				ctx.fillRect(
					_gridWidth * (item.colNum - 0),
					_gridHeight * (item.rowNum - 0),
					_gridWidth,
					_gridHeight
				);

				ctx.fillStyle = colors[i].color;

				ctx.fillText(
					item.volumeLabel,
					_gridWidth * (item.colNum - 0) + 14,
					_gridHeight * (item.rowNum - 0) + 22
				);
			});
		});

		ctx.stroke();
	}

	// 搜索高亮
	function searchLight(result) {
		// 找到当前的dom
		var cas = document.getElementById('canvasId');

		var _gridWidth = gridWidth;
		var _gridHeight = gridHeight;

		// 拿出画笔
		var ctx = cas.getContext('2d');

		ctx.font = '18px Courier New';
		ctx.strokeStyle = '#CCCCCC'; // 轮廓的颜色

		ContentWhite(); //先将其他的全置为白色

		result.forEach(function (item) {
			ctx.rect(
				_gridWidth * (item.colNum - 0),
				_gridHeight * (item.rowNum - 0),
				_gridWidth,
				_gridHeight
			);

			ctx.fillStyle = colors[7].background; //背景;

			ctx.fillRect(
				_gridWidth * (item.colNum - 0),
				_gridHeight * (item.rowNum - 0),
				_gridWidth,
				_gridHeight
			);

			ctx.fillStyle = colors[7].color;

			ctx.fillText(
				item.volumeLabel,
				_gridWidth * (item.colNum - 0) + 14,
				_gridHeight * (item.rowNum - 0) + 22
			);
		});

		ctx.stroke();
	}

	// 搜索让map高亮
	function searchMapLight(result) {
		mapCanvas();

		// 找到当前的dom
		var cas = document.getElementById('map_line');

		// 拿出画笔
		var ctx = cas.getContext('2d');

		result.forEach(function (item) {
			ctx.fillStyle = colors[7].background;

			ctx.fillRect(
				mapGridWidth * (item.colNum - 0),
				mapGridHeight * (item.rowNum - 0),
				mapGridWidth,
				mapGridHeight
			);
		});

		ctx.stroke();
	}

	//监视窗口的变化, 改变之后重新刷新
	function windowResize() {
		$('.container').height($('.box_far').height() - 60 + 'px');
		$('.content').height($('.right').height() - 60 + 'px');

		$('.pointer').height(
			($('.content').height() / mainHeight) * $('.pointer_main').height() + 'px'
		);
		$('.pointer').width(
			($('.content').width() / mainWidth) * $('.pointer_main').width() + 'px'
		);
	}

	// 执行函数之后,导出excel jsonData excel所需要的数据, sheetName 文件名, sheetHeader 上面的头部
	function JsonToExcel(jsonData, fileName, sheetName, sheetHeader) {
		var option = {};

		option.fileName = fileName;

		option.datas = [
			{
				sheetData: jsonData, //数据
				sheetName: sheetName, //名称
				sheetHeader: sheetHeader, //头
			},
		];

		var toExcel = new ExportJsonExcel(option);

		toExcel.saveExcel();
	}

	// 执行函数后,转换成导出excel需要的数组
	function toExcelList(allData, lineArr) {
		var arrayList = [];

		for (var i = 0; i < lineArr.length; i++) {
			var temp = [];

			allData.forEach(function (value, index) {
				if (allData[index].data[i]) {
					temp.push(allData[index].data[i].volumeLabel);
				} else {
					temp.push('');
				}
			});

			arrayList.push(temp);
		}

		return arrayList;
	}
});
