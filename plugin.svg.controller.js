function controller(shape){
	this.shape = shape;
	this.init();
}

controller.prototype.init = function(){
	var shape = this.shape;
	shape.addEventListener('click', function(){
		console.log('click');
	});
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
		if(shape.isMouseDown){
			var deltaX = event.clientX - shape.lastPosition.x,
				deltaY = event.clientY - shape.lastPosition.y,
				top = getComputedStyle(shape).top,
				left = getComputedStyle(shape).left;
			console.log(deltaX, deltaY);
			shape.style.top = parseInt(top) + deltaY;
			shape.style.left = parseInt(left) + deltaX;
			shape.lastPosition = {
				x: event.clientX,
				y: event.clientY
			}
		}
	});
}