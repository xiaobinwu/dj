/**
 * 验证码倒计时组件
 *
 * @author xiaobin_wu
 */
class CountDown {
    constructor(pageContext){
        //外层需要有个_getCode函数
        this.page = pageContext; //获取页面上下文
        this.time = 0;
        this.page.setData({
            disabled: true,
            plain: false,
            text: '获取验证码'
        })
    }
    //尽量将挂载到页面的data修改动作移至组件里面来做
    setDisabledValue(bol){
        this.page.setData({
            disabled: bol
        });
    }
    run(sec){
        this.time = sec;
        this.countDown();
    }
    countDown(){
        if(this.time > 0) {
            this.time--;
            this.page.setData({
                disabled: true,
                text: this.time + '秒后重新获取'
            });
            setTimeout(this.countDown.bind(this), 1000);
        }else{
            this.page.setData({
                disabled: false,
                text: '获取验证码'
            });
        }
    }
}
module.exports = CountDown