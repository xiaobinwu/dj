/** 
 * 需要一个目标日期，初始化时，先得出到当前时间还有剩余多少秒
 * 1.将秒数换成格式化输出为XX天XX小时XX分钟XX秒 XX
 * 2.提供一个时钟，每10ms运行一次，渲染时钟，再总ms数自减10
 * 3.剩余的秒次为零时，return，给出tips提示说，已经截止
 */

// 定义一个总毫秒数，以一分钟为例。TODO，传入一个时间点，转换成总毫秒

//参数
/*
    {
        context => 作用域
        second => 总毫秒数
        accuracy => 精度
        done => 完成回调
        endText => 结束文案
        isCustom => 是否自定义data，用于数组或是对象, 默认false
        customDataName => 自定义数据名，用于数组或是对象，默认为 ''
        index => 数组data的索引值,用于数组或是对象
    }
*/
/* 毫秒级倒计时 */
function Countdown(options){
    this.options = options;
    this.context = options.context;
    this.second = options.second;
    this.accuracy = parseInt(options.accuracy) || 100;
    this.done = options.done || function(options){ console.log(options) };
    this.start = options.start || function(flag){ console.log(flag) };
    this.endText = options.endText;
    this.isCustom = options.isCustom || false;
    this.customDataName = options.customDataName || '';
    this.index = options.index;
    this.flag = 't' + Date.parse(new Date());
}
Countdown.prototype = {
    run: function(){
        var _self = this;
        // 渲染倒计时时钟
        this.flag = setInterval(function(){

            if(_self.isCustom && _self.customDataName !== ''){
                var param = {};
                    param[_self.customDataName] = _self.dateformat(_self.second);
                    _self.context.setData(param);
            }else{
                _self.context.setData({
                    clock: _self.dateformat(_self.second)
                });
            }
            if (_self.second <= 0) {
                clearInterval(_self.flag);
                if(_self.isCustom && _self.customDataName !== ''){
                    var endParam = {};
                    endParam[_self.customDataName] = _self.endText;
                    _self.context.setData(endParam);
                }else{
                    _self.context.setData({
                        clock: _self.endText
                    });
                }
                _self.done && _self.done(_self.options);
                return;
            }    

            // 放在最后--
            _self.second -= _self.accuracy;
        }, this.accuracy);
     //开始倒计时
     this.start && this.start(this.flag);
    },
    // 时间格式化输出，如3:25:19 86。每100ms都会调用一次
    dateformat: function(micro_second){
        // 秒数
        var second = Math.floor(micro_second / 1000);
        //天数位
        var day = Math.floor(second / 86400);
        // 小时位
        var hr = Math.floor((second - day * 86400)/ 3600);
        // 分钟位
        var min = Math.floor((second - day * 86400 - hr * 3600) / 60);
        // 秒位
        var sec = (second - day * 86400 - hr * 3600 - min * 60);// equal to => var sec = second % 60;
        // 毫秒位，保留2位
        var micro_sec = Math.floor((micro_second % 1000) / 100);
        return (day > 0 ?  day + '天' : '') + this.add0(hr) + ":" + this.add0(min) + ":" + this.add0(sec) + "." + this.add0(micro_sec);
    },
    add0: function(num, max){
        return num<(max?max:10)?"0"+num:num;
    }
}


module.exports = Countdown