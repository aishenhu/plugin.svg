var ShapeManager = {
	init : function(){
		this._shapes = [{
			title: '箭头',
			url: 'assets/arrow.svg',
		},{
			title: '双向箭头',
			url: 'assets/double-arrow.svg'
		},{
			title: '线条',
			url: 'assets/line.svg'
		},{
			title: '方形',
			url: 'assets/square.svg'
		},{
			title: '三角形',
			url: 'assets/triangle.svg'
		}];
	},

	getShapeList: function(){
		return this._shapes;
	}, 
	/**
	 * load shape and create dom element
	 */
	loadShape: function(url, callback){
		var self = this;
		var $H = new http();
		$H.ajax(url, {
			onSuccess: function(data){
				var shape = data.responseXML.getElementsByTagName('svg')[0];
				// self._shapeDomList.push(shape);
				callback(shape);
			}
		});
	},

	loadIcons: function(callback){
		var self = this;
		var $H = new http();

		var icons =[];
		$H.ajax('assets/icon.js', {
			onSuccess: function(data){
				eval(data.responseText);
				for(var i in _plugin_icon){
					var iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					iconSvg.setAttribute('width', 40);
					iconSvg.setAttribute('height', 40);
					iconSvg.setAttribute('version', 1.1);
					var iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
					iconPath.setAttribute('d', _plugin_icon[i]);
					iconSvg.appendChild(iconPath);
					icons.push({
						title: i,
						svgEl: iconSvg						
					});
				}
				callback(icons);
			}
		});
	}
}

/**
 * svg plugin使用封装
 *
 */
var svg = $namespace('plugin.svg');
svg.init = function(){
	ShapeManager.init();
	var ui = plugin.svg.ui;
	ui.init();
	svg.bindEvents();
}

/**
 * observer事件：
 * 1. 'add': 请求添加一个svg元素
 * 	         传递参数： param = {
 * 	         	event,  //拖拽的方式：event是mouseup时产生的事件
 * 	         	target  //要添加的svg元素
 * 	         }
 */
svg.bindEvents = function(){
	var ui = plugin.svg.ui;
	addObserver(ui, 'add', function(param){
		var shape = param.target;
		shape.style.position = 'absolute';
		shape.style.left = param.event.pageX;
		shape.style.top = param.event.pageY;
		var sc = new controller(shape);//为添加的图形添加控制器
		document.body.appendChild(shape);
	});

	addObserver(svg, 'showShapePanel', function(param){
		notifyObservers(ui, 'showShapePanel', param);
	});

	addObserver(svg, 'hideShapePanel', function(param){
		notifyObservers(ui, 'hideShapePanel', param);
	});

	addObserver(svg, 'showStylePanel', function(param){
		notifyObservers(ui, 'showStylePanel', param);
	});

	addObserver(svg, 'hideStylePanel', function(param){
		notifyObservers(ui, 'hideStylePanel', param);
	});
}

