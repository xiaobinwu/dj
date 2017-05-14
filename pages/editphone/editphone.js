// pages/editphone/editphone.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
//引入倒计时组件
var CountDown = require('../../template/count-down/count-down.js');
var appInstance = getApp();
Page({
  data:{
      oldUserPhone: '',
      newUserPhone: '',
      code: '',
      isNotSubmit: true,
  },
  judge: function(){
      if(!appInstance.globalData.userInfo.hasData){
          wx.navigateBack({
            delta: 2
          });
      }
  },
  checkPhone: function(phone){
      if(!/^1[34578]\d{9}$/.test(phone) || phone === ''){
        return false;
      }
      return true;
  },
  checkOldPhone: function(e){
    this.countDown.setDisabledValue(true);
    if(!this.checkPhone(e.detail.value)){
        return wx.showToast({
          title: '旧手机号格式不正确或为空',
          duration: 1000
        });
    }
    var _this = this;
        util.getToken().then(token => {
            util.wxRequest({
                method: 'POST',
                url: ports.checkPhone,
                header:{ 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'},
                data: {
                    old_phone: e.detail.value
                }
            }).then((res) => {
              if(res.status !== 0){
                return wx.showToast({
                  title: res.msg,
                  duration: 1000
                });
              }
              _this.countDown.setDisabledValue(false);
              _this.setData({
                  oldUserPhone: e.detail.value
              });
            }).catch((err) => {
              return wx.showToast({
                title: err,
                duration: 1000
              });
            });
        });
  },
  updateNewPhone: function(e){
      this.setData({
        newUserPhone: e.detail.value
      });
  },
  updateCode: function(e){
      this.setData({
        code: e.detail.value
      });
  },
  _getCode: function(){
      if(!this.checkPhone(this.data.newUserPhone)){
        return wx.showToast({
          title: '新手机号格式不正确或为空',
          duration: 1000
        });
      }
      var _this = this;
          util.getToken().then(token => {
              util.wxRequest({
                  method: 'POST',
                  url: ports.sendMsg,
                  header:{'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'},
                  data: {
                      phone: _this.data.newUserPhone
                  }
              }).then((res) => {

                wx.showToast({
                  title: '请查收手机验证码',
                  duration: 1000
                });
                _this.setData({
                    isNotSubmit: false
                });
                _this.countDown.run(60);
              }).catch((err) => {
                  return wx.showToast({
                    title: err,
                    duration: 1000
                  });
              });
          });
  },
  submit(){
      var _this = this;
      if(!this.checkPhone(this.data.newUserPhone)){
          return wx.showToast({
            title: '手机号格式不正确或为空',
            duration: 1000
          });
      }
      if(!/^\d{6}$/.test(this.data.code)){
          return wx.showToast({
            title: '验证码为6个数字',
            duration: 1000
          });
      }
      util.getToken().then(token => {
          util.wxRequest({
              method: 'POST',
              url: ports.updatePhone,
              header:{'X-Auth-Token':token, 'content-type': 'application/x-www-form-urlencoded'},
              data: {
                  phone: _this.data.newUserPhone,
                  old_phone: _this.data.oldUserPhone,
                  verifycode: _this.data.code,
              }
          }).then((res) => {
            if(res.status === 0){            
                appInstance.globalData.userInfo.phone = res.data.phone;
                wx.showToast({
                  title: res.msg,
                  icon: 'success',
                  duration: 1000,
                  success: function(){
                    setTimeout(function(){
                      wx.navigateBack({
                        delta: 1
                      });
                    }, 1000);
                  }
                });
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
      });
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.judge();
    //初始化倒计时组件
    this.countDown = new CountDown(this);
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