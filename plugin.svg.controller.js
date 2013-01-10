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
}

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
	foreach(self.cmd, function(cmd){
		var eventType = __CMD_MAP[cmd.name].event;
		switch(eventType){
			case 'click':
				break;
			case 'drag':
				bindCustomDragEvent(self.point, function(){
					console.log(self.point.isMouseDown, 'drag');
				});
				break;
			default:
				break;
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