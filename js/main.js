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
    var self = this;
    var wrap = self.wrap;
    var list = self.list;
    self.outer = document.createElement('ul');
    //根据元素的
    $.ajax({
        url:'./mock.json',
        type:'GET',
        dataType:'json',
        data:{
            type:'init'
        }
    }).done(function (data) {
        var code = data.code;
        self.lanternRiddles = data.result;
        for(var i = 0; i < self.lanternRiddles.length; i++) {
            var li = document.createElement('li');
            var index = Math.floor(Math.random() * 3);
            var item = list[index];
            var status = "normal",imgSrc = item['img'];
            switch (Number(self.lanternRiddles[i].status)){
                case -1:
                    status = "grey";
                    break;
                case 1:
                    status = "bright";
                    imgSrc = item['brightImg']
            }

            li.style.width = self.scaleW + 'px';
            li.style.webkitTransform = 'translate3d(' + i * self.scaleW + 'px, 0, 0)';
            i == 1 && (li.style.webkitTransform = 'translate3d(' + i * self.scaleW + 'px, 0, 0) scale(1.2)');

            if (item) {
                li.innerHTML = '<img class="lanternImg '+ status +'" data-LanternIndex="' + index + '" data-num="2" data-index="'+ i +'" src="' + imgSrc + '">';
            }

            $(self.outer).css('width', self.scaleW * 40 + 'px');
            $(li).addClass('lantern');
            $(self.outer).addClass('lanternsArea');
            self.outer.appendChild(li);
        }
    });

    //UL的宽度和画布宽度一致
    wrap.appendChild(self.outer);
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
                var $target = $(evt.target);
                handleLantern($target);
            }
        }
    };

    //点击灯笼弹层出现
    var handleLantern = function ($target) {
        if($target.hasClass('lanternImg') && !$target.hasClass('bright') && !$target.hasClass('grey')){
            /*
            * num:答题次数
            * index：40个排在第几个
            * lanternIndex：第几个形状的灯笼
            * */
            var num = $target.attr('data-num'),index = $target.attr('data-index'),lanternIndex = $target.attr('data-lanternIndex');
            var $popArea = $('.popArea'),
                $submitAnswer = $popArea.find('.submitAnswer'),
                $answerPageContentArea = $submitAnswer.find('.answerPageContentArea'),
                $lanternPopBackImg = $answerPageContentArea.find('.lanternPopBackImg'),
                $lanternPopContent = $answerPageContentArea.find('.answerPageContent'),
                $lanternSubmitBtn = $lanternPopContent.find('.submitBtn');


            $lanternPopBackImg.attr('src','./img/lanternPop_'+lanternIndex+'.png');
            //谜面
            $lanternPopContent.find('.riddles').text(self.lanternRiddles[lanternIndex].riddle);
            $lanternPopContent.find('.riddlesHint').text(self.lanternRiddles[lanternIndex].riddlesHint);
            $lanternSubmitBtn.attr('data-index',index);
            $lanternSubmitBtn.attr('data-num',num);
            $popArea.show();
            $submitAnswer.show().siblings().hide();
            $answerPageContentArea.show()
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
        img: "img/lantern_0.png",
        brightImg:'img/lantern_0_bright.png'
    },
    {
        height: 440,
        width: 142,
        img: "img/lantern_1.png",
        brightImg:'img/lantern_1_bright.png'
    },
    {
        height: 440,
        width: 144,
        img: "img/lantern_2.png",
        brightImg:'img/lantern_2_bright.png'
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
        var _this = this,
            $popArea = $('.popArea'),
            $submitAnswer = $popArea.find('.submitAnswer'),
            $answerPageContentArea = $submitAnswer.find('.answerPageContentArea'),
            $answerPageContent = $answerPageContentArea.find('.answerPageContent'),
            $answerInput = $answerPageContent.find('.answerInput'),
            $submitBtn = $answerPageContent.find('.submitBtn'),
            $sucOrFailPopContent = $submitAnswer.find('.sucOrFailPopContent'),
            $chooseCoupon = $popArea.find('.chooseCoupon'),
            $couponPageContent = $chooseCoupon.find('.couponPageContent'),
            $couponPopContent = $chooseCoupon.find('.couponPopContent');
        $('.ruleBtn').on('click',function () {
            $popArea.show();
            $popArea.find('.rulePop').show().siblings().hide();
        });
        $('.popContent').on('click','.close',function () {
            $popArea.hide();
        });
        /*除了灯笼相关事件（点击和滑动），其余事件写在此处*/
        $answerInput.on('input',function () {
            var inputVal = $(this).val();
            if(inputVal != ''){
                $submitBtn.addClass('active')
            }else{
                $submitBtn.removeClass('active')
            }
        });
        $submitBtn.on('click',function () {
            if($(this).hasClass('active')){
                var inputVal = $answerInput.val();
                var index = $(this).attr('data-index');//第几个灯笼
                var num = $(this).attr('data-num');//第几次答题
                $.ajax({
                    url:'./mock.json',
                    type:'GET',
                    dataType:'json',
                    data:{
                        type:'answer',
                        answer:inputVal,
                        index:index,
                        answerNum:num
                    }
                }).done(function(data){
                    _this.dataProcess(data)
                })
            }
        })
    },
    dataProcess:function (data) {

    }
};
lanternRiddles.init();