/** 
 * 需要一个目标日期，初始化时，先得出到当前时间还有剩余多少秒
 * 1.将秒数换成格式化输出为XX天XX小时XX分钟XX秒 XX
 * 2.提供一个时钟，每10ms运行一次，渲染时钟，再总ms数自减10
 * 3.剩余的秒次为零时，return，给出tips提示说，已经截止
 */

// 定义一个总毫秒数，以一分钟为例。TODO，传入一个时间点，转换成总毫秒数


/* 毫秒级倒计时 */
function countdown(that, total_micro_second, done) {
      // 渲染倒计时时钟
      that.setData({
          clock:dateformat(total_micro_second)
      });

      if (total_micro_second <= 0) {
          that.setData({
              clock:"优惠已经截止"
          });
          done && done();
          return ;
      }    
      setTimeout(function(){
        // 放在最后--
        total_micro_second -= 100;
        countdown(that, total_micro_second, done);
    }
    ,100)
}

// 时间格式化输出，如3:25:19 86。每10ms都会调用一次
function dateformat(micro_second) {
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
    return day + '天' + add0(hr) + ":" + add0(min) + ":" + add0(sec) + "." + add0(micro_sec);
}

function add0(num,max){
    return num<(max?max:10)?"0"+num:num;
}

module.exports = {
    countdown: countdown
}