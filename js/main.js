/**
 * Created by Administrator on 2017/1/14.
 */

//构造函数
function Slider(opts){
    //构造函数需要的参数
    this.wrap = opts.dom;
    this.list = opts.list;
    //构造三步奏
    this.init();
    this.renderDOM();
    this.bindDOM();
}
//第一步 -- 初始化
Slider.prototype.init = function() {
    //设定窗口比率
    this.scaleH = window.innerWidth*440/640;
    //设定一页的宽度
    this.scaleW = window.innerWidth*0.84375/3;
    //设定初始的索引值
    this.idx = 1;
};
//第二步 -- 根据数据渲染DOM
Slider.prototype.renderDOM = function(){
    var wrap = this.wrap;
    var data = this.list;

    this.outer = document.createElement('ul');
    //根据元素的
    for(var i = 0; i < 40; i++){
        var li = document.createElement('li');
        var index = Math.floor(Math.random()*3);
        var item = data[index];
        li.style.width = this.scaleW +'px';
        li.style.webkitTransform = 'translate3d('+ i*this.scaleW +'px, 0, 0)';
        i == 1 && (li.style.webkitTransform = 'translate3d('+ i*this.scaleW +'px, 0, 0) scale(1.2)');
        if(item){
            li.innerHTML = '<img  src="'+ item['img'] +'">';
        }

        $(this.outer).css('width',this.scaleW * 40 + 'px');
        $(li).addClass('lantern');
        $(this.outer).addClass('lanternsArea');
        this.outer.appendChild(li);


    }

    //UL的宽度和画布宽度一致
    wrap.appendChild(this.outer);
};
Slider.prototype.goIndex = function(n){
    var idx = this.idx;
    var lis = this.outer.getElementsByTagName('li');
    var len = lis.length;
    var cidx;

    //如果传数字 2,3 之类可以使得直接滑动到该索引
    if(typeof n == 'number'){
        cidx = idx;
        //如果是传字符则为索引的变化
    }else if(typeof n == 'string'){
        cidx = idx + n*1;
    }

    //当索引右超出
    if(cidx > len-1){
        cidx = len - 1;
        //当索引左超出
    }else if(cidx < 0){
        cidx = 0;
    }

    //保留当前索引值
    this.idx = cidx;

    //改变过渡的方式，从无动画变为有动画

    lis[cidx-2] && (lis[cidx-2].style.webkitTransition = '-webkit-transform 0.2s ease-out');
    lis[cidx-1] && (lis[cidx-1].style.webkitTransition = '-webkit-transform 0.2s ease-out');
    lis[cidx].style.webkitTransition = '-webkit-transform 0.2s ease-out';
    lis[cidx+1] && (lis[cidx+1].style.webkitTransition = '-webkit-transform 0.2s ease-out');
    lis[cidx+2] && (lis[cidx+2].style.webkitTransition = '-webkit-transform 0.2s ease-out');

    //改变动画后所应该的位移值
    lis[cidx-2] && (lis[cidx-2].style.webkitTransform = 'translate3d(-'+ this.scaleW +'px, 0, 0)');
    lis[cidx-1] && (lis[cidx-1].style.webkitTransform = 'translate3d(0, 0, 0)');
    lis[cidx].style.webkitTransform = 'translate3d('+ this.scaleW +'px, 0, 0) scale(1.2)';
    lis[cidx+1] && (lis[cidx+1].style.webkitTransform = 'translate3d('+ this.scaleW*2 +'px, 0, 0)');
    lis[cidx+2] && (lis[cidx+2].style.webkitTransform = 'translate3d('+ this.scaleW*3 +'px, 0, 0)');
};
//第三步 -- 绑定 DOM 事件
Slider.prototype.bindDOM = function(){
    var self = this;
    var scaleW = self.scaleW;
    var outer = self.outer;
    var len = self.list.length;

    //手指按下的处理事件
    var startHandler = function(evt){

        //记录刚刚开始按下的时间
        self.startTime = new Date() * 1;

        //记录手指按下的坐标
        self.startX = evt.touches[0].pageX;

        //清除偏移量
        self.offsetX = 0;

        //事件对象
        var target = evt.target;
        while(target.nodeName != 'LI' && target.nodeName != 'BODY'){
            target = target.parentNode;
        }
        self.target = target;

    };

    //手指移动的处理事件
    var moveHandler = function(evt){
        //兼容chrome android，阻止浏览器默认行为
        evt.preventDefault();

        //计算手指的偏移量
        self.offsetX = evt.targetTouches[0].pageX - self.startX;

        var lis = outer.getElementsByTagName('li');
        //起始索引
        var i = self.idx - 2;
        //结束索引
        var m = i + 5;

        //最小化改变DOM属性
        for(i; i < m; i++){
            lis[i] && (lis[i].style.webkitTransition = '-webkit-transform 0s ease-out');
            lis[i] && (lis[i].style.webkitTransform = 'translate3d('+ ((i-self.idx+1)*self.scaleW + self.offsetX) +'px, 0, 0)');
        }
    };

    //手指抬起的处理事件
    var endHandler = function(evt){
        evt.preventDefault();

        //边界就翻页值
        var boundary = scaleW/6;

        //手指抬起的时间值
        var endTime = new Date() * 1;

        //所有列表项
        var lis = outer.getElementsByTagName('li');

        //当手指移动时间超过300ms 的时候，按位移算
        if(endTime - self.startTime > 300){
            if(self.offsetX >= boundary){
                self.goIndex('-1');
            }else if(self.offsetX < 0 && self.offsetX < -boundary){
                self.goIndex('+1');
            }else{
                self.goIndex('0');
            }
        }else{
            //优化
            //快速移动也能使得翻页
            if(self.offsetX > 50){
                self.goIndex('-1');
            }else if(self.offsetX < -50){
                self.goIndex('+1');
            }else{
                self.goIndex('0');
            }
        }
    };

    //绑定事件
    outer.addEventListener('touchstart', startHandler);
    outer.addEventListener('touchmove', moveHandler);
    outer.addEventListener('touchend', endHandler);
};

var list = [
    {
        height: 440,
        width: 155,
        img: "img/lantern_1.png"
    },
    {
        height: 440,
        width: 142,
        img: "img/lantern_2.png"
    },
    {
        height: 440,
        width: 144,
        img: "img/lantern_2.png"
    }
];
var lanternRiddles = {
    init:function () {
        //初始化Slider 实例
        new Slider({
            dom : document.getElementById('canvas'),
            list : list
        });
        this.bind()
    },
    bind:function () {
        /*$('#canvas').on('touchstart','ul li img',function () {
            alert(1)
        })*/
    }
};
lanternRiddles.init()