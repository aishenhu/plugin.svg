var ui = $namespace('plugin.svg.ui');

ui._templates = {
	'shapePanel':'',
	'stylePanel':'<p class="title">Settings</p>\
			<ul class="options">\
				<li>\
					<span>stroke color</span>\
					<input type="text" data-ref="stroke"></input>\
				</li>\
				<li>\
					<span>stroke width</span>\
					<input type="text" data-ref="stroke-width"></input>\
				</li>\
				<li>\
					<span>fill color</span>\
					<input type="text" data-ref="fill"></input>\
				</li>\
			</ul>'
}

ui.init = function(){
	var shapePanelContainer, stylePanelContainer;
	shapePanelContainer = document.createElement('div');
	shapePanelContainer.setAttribute('id', 'shapePanelContainer');
	shapePanelContainer.innerHTML = ui._templates['shapePanel'];
	document.body.appendChild(shapePanelContainer);
	stylePanelContainer = document.createElement('div');
	stylePanelContainer.setAttribute('id', 'stylePanelContainer');
	stylePanelContainer.innerHTML = ui._templates['stylePanel'];
	document.body.appendChild(stylePanelContainer);
	var shapes = ShapeManager.getShapeList();
	var sp = document.createElement('div');
	sp.setAttribute('id', 'plugin-shapes');
	var ip = document.createElement('div');
	ip.setAttribute('id', 'plugin-icons');
	shapePanelContainer.appendChild(sp);
	shapePanelContainer.appendChild(ip);
	ui.shapeTemplates = [];
	for(var i = 0; i < shapes.length; i ++){
		ShapeManager.loadShape(shapes[i].url, function(shape){
			shape.style.top = shape.style.left = 300;
			sp.appendChild(shape);
			// new controller(shape);
			ui.shapeTemplates.push(shape);
			ui.bindShapeEvents(shape);
		});
	}

	ShapeManager.loadIcons(function(icons){
		foreach(icons, function(icon){
			ip.appendChild(icon.svgEl);
			ui.shapeTemplates.push(icon.svgEl);
			ui.bindShapeEvents(icon.svgEl);
		});
	});
	ui.shapePanelContainer = shapePanelContainer;
	ui.stylePanelContainer = stylePanelContainer;
	ui.bindEvents();
	ui.stylePanelContainer.style.display = 'none';
	ui.isShowStylePanel = ui.isShowShapePanel = false;
}

ui._initStyle = function(target){
	ui.setting = {};
	ui.setting.target = target;
	ui.setting.strokeInput = ui.stylePanelContainer.querySelector('[data-ref=stroke]');
	ui.setting.strokeWidthInput = ui.stylePanelContainer.querySelector('[data-ref=stroke-width]'),
	ui.setting.fillInput = ui.stylePanelContainer.querySelector('[data-ref=fill]');
	var style = getComputedStyle(target);

	ui.setting.strokeInput.value =  style['stroke'];
	ui.setting.strokeWidthInput.value = style['stroke-width'];
	ui.setting.fillInput.value = style['fill'];
}

ui.onSettingChange = function(){
	var stroke = ui.setting.strokeInput.value,
		strokeWidth = ui.setting.strokeWidthInput.value,
		fill = ui.setting.fillInput.value;
	console.log('onSettingChange', fill);
	stroke && ui.setting.target.setAttribute('stroke', stroke);
	strokeWidth && ui.setting.target.setAttribute('stroke-width', strokeWidth);
	fill && ui.setting.target.setAttribute('fill', fill);
}

ui.onShowStylePanel = function(param){
	ui._initStyle(param.target);
	ui.stylePanelContainer.style.display = 'block';
	ui.isShowStylePanel = true;
}

ui.onHideStylePanel = function(param){
	ui.stylePanelContainer.style.display = 'none';
	ui.isShowStylePanel = false;
}

ui.onShowShapePanel = function(param){
	param = param || {};
	var top = param.top || 0,
		left = param.left || 0;
	ui.shapePanelContainer.style.top = top;
	ui.shapePanelContainer.style.left = left;
	ui.shapePanelContainer.style.display = 'block';
	ui.isShowShapePanel = true;
}

ui.onHideShapePanel = function(param){
	ui.shapePanelContainer.style.display = 'none';
	ui.isShowShapePanel = false;
}

/**
 * 加载时间不定，单独处理每个svg元素
 * @return {[type]} [description]
 */
ui.bindShapeEvents = function(template){
	var target = {};
	target.point = template;
	bindCustomDragEvent(target);
	addObserver(target,'mouseup', function(param){
		param.target = template.cloneNode(true);
		notifyObservers(ui, 'add', param);
	})
}

ui.bindEvents = function(){
	ui.stylePanelContainer.addEventListener('input', function(event){
		notifyObservers(ui, 'settingChange');
	});

	addObserver(ui, 'showStylePanel', ui.onShowStylePanel);
	addObserver(ui, 'hideStylePanel', ui.onHideStylePanel);
	addObserver(ui, 'settingChange', ui.onSettingChange);
	addObserver(ui, 'showShapePanel', ui.onShowShapePanel);
	addObserver(ui, 'hideShapePanel', ui.onHideShapePanel);
}