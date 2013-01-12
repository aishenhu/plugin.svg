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
	}
};

/**
 * 创建操作svg元素的工具集
 */
(function(){
	$namespace('plugin.svg.tools');
	window.$T = plugin.svg.tools;

	/**
	 * 改变一个svg元素的宽度
	 * @return
	 */
	$T.resizeX = function(svgEl, delta){
		var type = svgEl.tagName,
			transformText = svgEl.getAttribute('transform') || '',
			param = transformText.match(/scale\(([^,]+),([^,]+)\)/);
		svgEl.setAttribute('transform', 'scale(1.2, 1)');
		// switch(type){
		// 	case 'line':
		// 		var x2 = parseInt(svgEl.getAttribute('x2'));
		// 		svgEl.setAttribute('x2', x2 + delta);
		// 		break;
		// 	default:
		// 		break;
		// }
	}

	/**
	 * svg元素的translate操作
	 */
	$T.translate = function(svgEl, deltaX, deltaY){
		var type = svgEl.tagName;
		//svgEl.setAttribute('transform', 'translate('+deltaX+','+deltaY +')');
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
				var target = document.querySelector('[cpid=' + cmd[1] + ']');
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

cp.prototype.onDrag = function(param){
	var self = this,
		lastEvent = param.lastEvent,
		event = param.event;

	var deltaX = event.pageX - lastEvent.pageX,
		deltaY = event.clientY - lastEvent.clientY;

	foreach(self.cmd, function(cmd){
		var eventType = __CMD_MAP[cmd.name].event;
		if(eventType == 'drag'){
			switch(cmd.name){
				case 'resize-x':
					$T.resizeX(cmd.target, deltaX);
					break;
				case 'resize-y':
					
					break;
				case 'resize':
					
					break;
				case 'translate-x':
					$T.translate(cmd.target, deltaX, 0);
					break;
				case 'translate-y':
					break;
				case 'translate':
					break;
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
}

controller.prototype.initControlPoints = function(shape){
	var self = this;
	var points = document.querySelectorAll('.control-point', shape);
	debugger;
	foreach(points, function(point){
		self.cpList.push(new cp(point));
	});
	console.log(self.cpList);
}

controller.prototype.init = function(){
	var shape = this.shape;
	this.initControlPoints(shape);
	shape.addEventListener('click', function(){
		var cps = document.querySelectorAll('.control-panel', shape);
		foreach(cps, function(cp){
			cp.style.display = 'block';
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
        target.isMouseDown = false;
        if(target.isMouseDown){
        	notifyObservers(target, 'mouseup', {lastEvent: _lastEvent, event: event});
        }
    });
}