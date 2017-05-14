// pages/login/login.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
//引入倒计时组件
var CountDown = require('../../template/count-down/count-down.js');
var appInstance = getApp();
Page({
  data:{
    phone: '',
    code: '',
    isNotSubmit: true
  },
  updatePhone: function(e){
      this.setData({
        phone: e.detail.value
      });
  },
  updateCode: function(e){
      this.setData({
        code: e.detail.value
      });
  },
  checkPhone: function(phone){
      if(!/^1[34578]\d{9}$/.test(phone) || phone === ''){
        return false;
      }
      return true;
  },
  checkCode: function(code) {
      if(!/[0-9]{6}$/.test(code)) {
          return false;
      }
      return true;
  },
  _getCode: function(){
      if(!this.checkPhone(this.data.phone)){
        return wx.showToast({
          title: '手机号格式不正确或为空',
          duration: 1000
        });
      }
      var _this = this;     
      util.wxRequest({
          method: 'POST',
          url: ports.sendPhoneMessage,
          header:{'content-type': 'application/x-www-form-urlencoded'},
          data: {
              phone: _this.data.phone
          }
      }).then((res) => {
        if(res.status === 0){
            wx.showToast({
              title: '请查收手机验证码',
              duration: 1000
            });
            _this.setData({
                isNotSubmit: false
            });
            _this.countDown.run(60);
        }else{
            return wx.showToast({
              title: res.msg,
              duration: 1000
            });
        }
      }).catch((err) => {
          return wx.showToast({
            title: err,
            duration: 1000
          });
      });
  },
  doLogin: function() {
      var _this = this;   
      if(!this.checkCode(this.data.code)){
        return wx.showToast({
          title: '验证码错误',
          duration: 1000
        });
      }
      util.wxRequest({
          url: ports.doLogin,
          method: 'POST',
          header:{'content-type': 'application/x-www-form-urlencoded'},
          data: {
              phone: _this.data.phone,
              verifycode: _this.data.code
          }
      }).then(res => {
          if(res.status === 0) {
              return util.updateToken().then((res) => {
                  wx.navigateBack({
                    delta: 1
                  });
              })
          }else {
            return wx.showToast({
              title: res.msg,
              duration: 1000
            });
          }
      }).catch(err => {
          console.log(err)
      })
  },

  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    //初始化倒计时组件
    this.countDown = new CountDown(this);
    this.countDown.setDisabledValue(false);
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})