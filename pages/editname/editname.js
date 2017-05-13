// pages/editname/editname.js
//获取app实例
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var appInstance = getApp();
Page({
  data:{
    userName: ''
  },
  judge: function(){
        if(!appInstance.globalData.userInfo.hasData){
            wx.navigateBack({
              delta: 2
            });
        }
  },
  submit(e){
        var _self = this;
        util.getToken().then(token => {
            util.wxRequest({
                method: 'POST',
                url: ports.updateNickName,
                header:{ 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded' },
                data: {
                    nickname: e.detail.value 
                }
            }).then((res) => {
              appInstance.globalData.userInfo.nickname = e.detail.value;
              wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 1000,
                success: function(){
                  setTimeout(function(){
                    wx.navigateBack({
                      delta: 1
                    });
                  }, 1000);
                }
              })
            });
        });
  },
  onLoad:function(options){
      this.judge();
      this.setData({
        userName: appInstance.globalData.userInfo.nickname
      });
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