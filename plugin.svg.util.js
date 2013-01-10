/**
 * code from JX
 */
var http = function(){
	// 兼容不同浏览器的 Adapter 适配层
    if(typeof window.XMLHttpRequest === "undefined"){
        /**
         * @ignore
         */
        window.XMLHttpRequest = function(){
            return new window.ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >=0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
        };
    }
    this.ajax = function(uri, options){
        var httpRequest,
            httpSuccess,
            timeout,
            isTimeout = false,
            isComplete = false;
        
        options = {
            method: options.method || "GET",
            data: options.data || null,
            arguments: options.arguments || null,

            onSuccess: options.onSuccess || function(){},
            onError: options.onError || function(){},
            onComplete: options.onComplete || function(){},
            //尚未测试
            onTimeout: options.onTimeout || function(){},

            isAsync: options.isAsync || true,
            timeout: options.timeout ? options.timeout : 30000,
            contentType: options.contentType ? options.contentType : "utf-8",
            type: options.type || "xml"
        };
        uri = uri || "";
        timeout = options.timeout;
        
        
        httpRequest = new window.XMLHttpRequest();
        httpRequest.open(options.method, uri, options.isAsync);
        //设置编码集
        //httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        httpRequest.setRequestHeader("Content-Type",options.contentType);
        httpRequest.setRequestHeader("X-Requested-With",'XMLHttpRequest');

        /**
         * @ignore
         */
        httpSuccess = function(r){
            try{
                return (!r.status && location.protocol == "file:")
                    || (r.status>=200 && r.status<300)
                    || (r.status==304)
                    || (navigator.userAgent.indexOf("Safari")>-1 && typeof r.status=="undefined");
            }catch(e){
                //J.out("错误：[" + e.name + "] "+e.message+", " + e.fileName+", 行号:"+e.lineNumber+"; stack:"+typeof e.stack, 2);
            }
            return false;
        }
        
        /**
         * @ignore
         */
        httpRequest.onreadystatechange=function (){
            if(httpRequest.readyState==4){
                if(!isTimeout){
                    var o={};
                        o.responseText = httpRequest.responseText;
                        o.responseXML = httpRequest.responseXML;
                        o.data= options.data;
                        o.status= httpRequest.status;
                        o.uri=uri;
                        o.arguments=options.arguments;
                        
                    if(httpSuccess(httpRequest)){
                        if(options.type === "script"){
                            eval.call(window, data);
                        }
                        options.onSuccess(o);
                        
                    }else{
                        options.onError(o);
                    }
                    options.onComplete(o);
                }
                isComplete = true;
                //删除对象,防止内存溢出
                httpRequest=null;
            }
        };
        
        httpRequest.send(options.data);
        
        window.setTimeout(function(){
            var o;
            if(!isComplete){
                isTimeout = true;
                o={};
                o.uri=uri;
                o.arguments=options.arguments;
                options.onTimeout(o);
                options.onComplete(o);
            }
        }, timeout);    
        
        return httpRequest;
    };
}


/**
 * 
 * 为自定义Model添加事件监听器
 * 
 * @method addObserver
 * @memberOf event
 * 
 * @param targetModel 目标 model，即被观察的目标
 * @param eventType 事件类型，不含on
 * @param handler 观察者要注册的事件处理器
 */
addObserver = function(targetModel, eventType, handler){
    var handlers,
        length,
        index,
        i;
    if(handler){
        
    
        // 转换成完整的事件描述字符串
        eventType = "on" + eventType;
        
        // 判断对象是否含有$events对象
        if(!targetModel._$events){
            targetModel._$events={};
        }
        
        // 判断对象的$events对象是否含有eventType描述的事件类型
        if(!targetModel._$events[eventType]){
            //若没有则新建
            targetModel._$events[eventType] = [];
        }else if(targetModel._$events[eventType].length == 0){
            //bug: ie会有引用泄漏的问题, 如果数组为空, 则重新创建一个
            targetModel._$events[eventType] = [];
        }
    
        handlers = targetModel._$events[eventType];
        length = handlers.length;
        index = -1;
    
        // 通过循环，判断对象的handlers数组是否已经含有要添加的handler
        for(i=0; i<length; i++){
            
            var tempHandler = handlers[i];

            if(tempHandler == handler){
                index = i;
                break;
            }        
        }
        // 如果没有找到，则加入此handler
        if(index === -1){
            handlers.push(handler);
            //alert(handlers[handlers.length-1])
        }
    }else{
        console.log(">>> 添加的观察者方法不存在："+targetModel+eventType+handler);
    }
};
/**
 * 
 * 批量为自定义Model添加事件监听器
 * 
 * @method addObservers
 * @memberOf event
 * 
 * @param obj 目标 model，即被观察的目标
 *     obj = { targetModel : {eventType:handler,eventType2:handler2...} , targetModel2: {eventType:handler,eventType2:handler2...}  }
 */
addObservers = function(obj){
    //TODO 这里的代码是直接复制addObserver的（为避免太多函数调用耗费栈）
    var t=obj['targetModel'];
    var m=obj['eventMapping'];
    for(var i in m){
        addObserver(t,i,m[i]);
    }

};
/**
 * 
 * 触发自定义Model事件的监听器
 * 
 * @method notifyObservers
 * @memberOf event
 * 
 * @param targetModel 目标 model，即被观察目标
 * @param eventType 事件类型，不含on
 * @param options 触发的参数对象
 * @return {Boolean} 
 */
notifyObservers = function(targetModel, eventType, argument){/*addInvokeTime(eventType);*/
    var handlers,
        i;
        
    eventType = "on" + eventType;
    var flag = true;
    if(targetModel._$events && targetModel._$events[eventType]){
        handlers = targetModel._$events[eventType];
        if(handlers.length > 0){
            // 通过循环，执行handlers数组所包含的所有函数function
            for(i=0; i<handlers.length; i++){
                if(handlers[i].apply(targetModel, [argument]) === false){
                    flag = false;
                }
            }
            //return flag;
        }
    }else{
        // throw new Error("还没有定义 [" + targetModel + "] 对象的: " + eventType + " 事件！");
        //return false;
    }
    return flag;
};


/**
 * 
 * 为自定义 Model 移除事件监听器
 * 
 * @method removeObserver
 * @memberOf event
 * 
 * @param targetModel 目标 model，即被观察的目标
 * @param eventType 事件类型，不含on
 * @param handler 观察者要取消注册的事件处理器
 */
// 按照对象和事件处理函数来移除事件处理函数
removeObserver = function(targetModel, eventType, handler){
    var i,
        j,
        flag = false,
        handlers,
        length,
        events = targetModel._$events;
    if(handler){
        
        if(events){
            eventType = "on" + eventType;
            handlers = events[eventType];
            
            if(handlers){
                length = handlers.length;
                for(i=0; i<length; i++){
                    //由==修改为===
                    if(handlers[i] == handler){
                        handlers[i] = null;
                        handlers.splice(i, 1);
                        flag = true;
                        break;
                    }    
                }
            }
            
            
        }
    }else if(eventType){
        if(events){
            eventType = "on" + eventType;
            handlers = events[eventType];
            if(handlers){
                length = handlers.length;
                for(i=0; i<length; i++){
                    handlers[i] = null;
                }
                delete events[eventType];
                flag = true;
            }
            
        }
        
    }else if(targetModel){
        if(events){
            for(i in events){
                delete events[i];
            }
            delete targetModel._$events;
            flag = true;
        }
    }
    return flag;
};

Array.prototype.each = function(func){
    var array = this;
    for(var i =0; i < array.length; i ++){
        func(array[i]);
    }
}

var foreach = function(obj, func){
    [].each.call(obj,func);
}

function $namespace(nsString){
    var nsArray = nsString.split('.'),
        ns = window;
    foreach(nsArray, function(str){
        ns[str] = ns[str] || {};
        ns = ns[str];
    });
}

function bindCustomDragEvent(target, func){
    var point = target.point;
    var _lastEvent;
    point.addEventListener('mousedown', function(event){
        target.isMouseDown = true;
        _lastEvent = event;
    });

    point.addEventListener('mousemove', function(event){
        if(target.isMouseDown){
            notifyObservers(target, 'drag', {lastEvent: _lastEvent, event: event});
        }
        _lastEvent = event;
    });

    document.body.addEventListener('mouseup', function(){
        target.isMouseDown = false;
    })
}