/**
 * 控制点命令的定义：
 * 		包括对应的鼠标样式和触发的事件类型
 * @type {Object}
 */
var __CMD_MAP = {
	'resize-x': {
		cursor: 'w-resize',
		event: 'drag'
	},'resize-y': {
		cursor: 's-resize',
		event: 'drag'
	},'resize': {
		cursor: 'default',
		event: 'drag'
	},'translate-x': {
		cursor: 'move',
		event: 'drag'
	},'translate-y': {
		cursor: 'move',
		event: 'drag'
	},'translate': {
		cursor: 'default',
		event: 'drag'
	},'rotate':{
		cursor: 'move',
		event: 'drag'
	}
};

/**
 * 创建操作svg元素的工具集
 */
(function(){
	$namespace('plugin.svg.tools');
	window.$T = plugin.svg.tools;

	/**
	 * 改变一个svg元素的大小
	 * @return
	 */
	$T.resize = function(svgEl, deltaX, deltaY){
		var type = svgEl.tagName;
		switch(type){
			case 'line':
				var x1 = parseFloat(svgEl.getAttribute('x1')),
					y1 = parseFloat(svgEl.getAttribute('y1')),
					x2 = parseFloat(svgEl.getAttribute('x2')),
					y2 = parseFloat(svgEl.getAttribute('y2'));
				x2 += deltaX;
				y2 += deltaY;
				svgEl.setAttribute('x2', x2);
				svgEl.setAttribute('y2', y2);
		}
		var svg = $T.getSvgContainer(svgEl),
			width = parseFloat(svg.getAttribute('width')),
			height = parseFloat(svg.getAttribute('height'));

		width += deltaX;
		height += deltaY;

		svg.setAttribute('width', width);
		svg.setAttribute('height', height);
		svg.setAttribute('viewBox', '0 0 '+ width + ' '+ height);
	}

	/**
	 * svg元素的translate操作(位移)
	 */
	$T.translate = function(svgEl, deltaX, deltaY){
		var type = svgEl.tagName,
			transformText = svgEl.getAttribute('transform') || ''; 
			param = transformText.match(/translate\(([^,]+),([^,]+)\)/);
		if(param){
			var tx = deltaX + parseInt(param[1]),
				ty = deltaY + parseInt(param[2]);
			transformText = transformText.replace(/translate\(([^,]+),([^,]+)\)/, 'translate('+tx+','+ty +')');
			svgEl.setAttribute('transform', transformText);
		}else{
			svgEl.setAttribute('transform', transformText + ' translate('+deltaX+','+deltaY +')');
		}
	}

	/**
	 * 对一个svg元素执行旋转操作
	 * @param  {[type]} svgEl [description]
	 * @param  {[type]} angle [description]
	 * @param  {[type]} cx    [description]
	 * @param  {[type]} cy    [description]
	 * @return {[type]}       [description]
	 */
	$T.rotate = function(svgEl, angle, cx, cy){
		var svg = $T.getSvgContainer(svgEl),
			svgRect = svg.getBoundingClientRect(),
			cr = svgEl.getBoundingClientRect();
		cx = cx || (cr.left - svgRect.left);
		cy = cy || (cr.top - svgRect.top);

		var transformText = svgEl.getAttribute('transform') || '',
			param = transformText.match(/rotate\(([^ ]+)([^,]*),([^,]*)\)/);

		if(param){
			angle += parseFloat(param[1]);
			transformText = transformText.replace(/rotate\(([^ ]+)([^,]*),([^,]*)\)/, 'rotate(' + angle + ' ' + cx + ',' + cy + ')');
			svgEl.setAttribute('transform', transformText);
		}else{
			svgEl.setAttribute('transform', transformText + ' rotate(' + angle + ' ' + cx + ',' + cy + ')');
		}

		svg.style['-webkit-transform'] = 'rotate(' + angle + ')';
	}

	$T.getAngle = function(svgEl, param){
		var cx, //计算的中心点
			cy, 
			originX, //原有的参照点 
			originY, 
			px, //变化的点
			py;

		var svg = $T.getSvgContainer(svgEl),
			svgRect = svg.getBoundingClientRect(),
			cr = svgEl.getBoundingClientRect();
		cx = param.centerX || (cr.left - svgRect.left);
		cy = param.centerY || (cr.top - svgRect.top);
		originX = param.originX;
		originY = param.originY;
		px = param.deltaX + param.originX;
		py = param.deltaY + param.originY;

		var angleO = Math.atan((originY - cy)*1.0 / (originX -cx)),
			angleP = Math.atan((py-cy)*1.0 / (px-cx));
		return (angleP -angleO) * Math.PI * 18;
	}

	/**
	 * 获取一个svg元素的顶层svg容器节点
	 * @return {[type]} [description]
	 */
	$T.getSvgContainer = function(svgEl){
		var i = 0;
		while(svgEl.tagName != 'svg' && i ++ < 20){
			svgEl = svgEl.parentNode;
		}
		return svgEl;
	}

	/**
	 * 获取一个svg元素相对于svg容器的相对坐标
	 * @param  {[type]} svgEl [description]
	 * @return {[type]}       [description]
	 */
	$T.getRelativePosition = function(svgEl){
		var svg = $T.getSvgContainer(svgEl),
			svgRect = svg.getBoundingClientRect(),
			cr = svgEl.getBoundingClientRect();
		return {
			x: cr.left - svgRect.left,
			y: cr.top -svgRect.top
		}
	}
})();

/**
 * 控制点
 * @param  {[type]} point [description]
 * @return {[type]}       [description]
 */
function cp(point){
	this.point = point;
	this.cmd = [];
	this.init();
}

cp.prototype.init = function(){
	var self = this;
	self.svgContainer = $T.getSvgContainer(self.point);
	//解析控制点命令
	self.parse();
	//设置相应的样式
	foreach(this.cmd, function(cmd){
		self.point.style['cursor'] = __CMD_MAP[cmd.name].cursor;
	});
	//绑定控制点的操作样式
	self.bindEvents();
}

/**
 * cmd 的格式：
 * cmdname: target,cmdname2: target
 * 其中target由cpid指定
 * @return {[type]} [description]
 */
cp.prototype.parse = function(){
	var cmdText = this.point.getAttribute('cmd'),
		self = this;
	if(cmdText){
		var cList = cmdText.split(',');
		foreach(cList, function(c){
			var cmd = c.split(':');
			if(cmd[1]){
				var target = self.svgContainer.querySelector('[cpid=' + cmd[1] + ']');
				self.cmd.push({
					name: cmd[0],
					target: target
				})
			}
		});
	}
}

/**
 * 绑定操作事件
 */
cp.prototype.bindEvents = function(){
	var self = this;
	$namespace('plugin.svg');
	addObserver(self, 'drag', self.onDrag);
	bindCustomDragEvent(self, {});

	// foreach(self.cmd, function(cmd){
	// 	var eventType = __CMD_MAP[cmd.name].event;
	// 	switch(eventType){
	// 		case 'click':
	// 			break;
	// 		case 'drag':				
				
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// });
}

/**
 * 控制点的drag事件处理
 * @param  {[type]} param [description]
 * @return {[type]}       [description]
 */
cp.prototype.onDrag = function(param){
	var self = this,
		lastEvent = param.lastEvent,
		event = param.event;

	var deltaX = event.pageX - lastEvent.pageX,
		deltaY = event.pageY - lastEvent.pageY;

	foreach(self.cmd, function(cmd){
		var eventType = __CMD_MAP[cmd.name].event;
		if(eventType == 'drag'){
			switch(cmd.name){
				case 'resize-x':
					$T.resize(cmd.target, deltaX, 0);
					break;
				case 'resize-y':
					$T.resize(cmd.target, 0, deltaY);
					break;
				case 'resize':
					$T.resize(cmd.target, deltaX, deltaY);
					break;
				case 'translate-x':
					$T.translate(cmd.target, deltaX, 0);
					break;
				case 'translate-y':
					$T.translate(cmd.target, 0, deltaY);
					break;
				case 'translate':
					$T.translate(cmd.target, deltaX, deltaY);
					break;
				case 'rotate':
					var param = {};
					var rp = $T.getRelativePosition(self.point);
					param.originX = rp.x;
					param.originY = rp.y;
					param.deltaX = deltaX;
					param.deltaY = deltaY;
					var angle = $T.getAngle(cmd.target, param);
					$T.rotate(cmd.target, angle);
				default:
					break;
			}
		}
	});
}

/**
 * 图形控制集合
 * @param  {[type]} shape [description]
 * @return {[type]}       [description]
 */
function controller(shape){
	this.shape = shape;
	this.cpList = [];
	this.init();
	console.log(shape);
}

controller.prototype.initControlPoints = function(shape){
	var self = this;
	var points = shape.querySelectorAll('.control-point');
	foreach(points, function(point){
		self.cpList.push(new cp(point));
	});
	console.log(self.cpList);
}

controller.prototype.init = function(){
	var shape = this.shape;
	this.initControlPoints(shape);
	
	shape.addEventListener('click', function(){
		var cps = shape.querySelectorAll('.control-panel');
		foreach(cps, function(cp){
			cp.style.display = 'block';
		});
		var ui = plugin.svg.ui;
		notifyObservers(ui, 'showStylePanel', {
			target: shape
		});
	});

	shape.addEventListener('blur', function(){
		console.log('blur');
	})
	shape.addEventListener('focus', function(){
		console.log('focus');
	})
	shape.addEventListener('mouseover', function(){
		console.log('mouseover');
	});
	shape.addEventListener('mousedown', function(event){
		shape.isMouseDown = true;
		shape.lastPosition = {
			x: event.clientX,
			y: event.clientY
		}
	});
	shape.addEventListener('mouseup', function(event){
		shape.isMouseDown = false;
	});
	shape.addEventListener('mouseout', function(event){
		//shape.isMouseDown = false;
	});
	shape.addEventListener('mousemove', function(event){
		// if(shape.isMouseDown){
		// 	var deltaX = event.clientX - shape.lastPosition.x,
		// 		deltaY = event.clientY - shape.lastPosition.y,
		// 		top = getComputedStyle(shape).top,
		// 		left = getComputedStyle(shape).left;
		// 	console.log(deltaX, deltaY);
		// 	shape.style.top = parseInt(top) + deltaY;
		// 	shape.style.left = parseInt(left) + deltaX;
		// 	shape.lastPosition = {
		// 		x: event.clientX,
		// 		y: event.clientY
		// 	}
		// }
	});
}


/**
 * 
 */
function dispachEvent(){

}

/**
 * 绑定自定义的拖动事件
 * @param  {[type]} target [description]
 * @param  {[type]} func   [description]
 * @return {[type]}        [description]
 */
function bindCustomDragEvent(target, func){
    var point = target.point;
    var _lastEvent;   //记录上一次的事件信息
    point.addEventListener('mousedown', function(event){
        target.isMouseDown = true;
        notifyObservers(target, 'mousedown', {lastEvent: _lastEvent, event: event});
        _lastEvent = event;
    });

    document.addEventListener('mousemove', function(event){
        if(target.isMouseDown){
            notifyObservers(target, 'drag', {lastEvent: _lastEvent, event: event});
        }
        _lastEvent = event;
    });

    document.addEventListener('mouseup', function(event){
        if(target.isMouseDown){
        	notifyObservers(target, 'mouseup', {lastEvent: _lastEvent, event: event});
        }
        target.isMouseDown = false;
    });
}