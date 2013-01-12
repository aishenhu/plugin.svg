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
	}
}

window.onload = function(){
	ShapeManager.init();
	var shapes = ShapeManager.getShapeList();
	var $H = new http();
	for(var i = 0; i < shapes.length; i ++){
		if(i > 0){
			return;
		}
		ShapeManager.loadShape(shapes[i].url, function(shape){
			shape.style.top = shape.style.left = 300;
			document.body.appendChild(shape);
			new controller(shape);

		});
	}

	setTimeout(function(){
		var list = document.querySelectorAll('svg');
		console.log(list);
	}, 1500);
}

