// pages/user-detail/user-detail.js
//获取app实例
var appInstance = getApp();
var polyfill = require('../../utils/polyfill.js');
Page({
  data:{
    userImg: null,
    userName: null,
    userPhone: null,
    userInfo: {}
  },
  judge: function(){
        if(!appInstance.globalData.userInfo.hasData){
            wx.navigateBack({
              delta: 1
            });
        }
  },
  onLoad:function(options){
    this.judge();
    this.setData({
      userImg: appInstance.globalData.userInfo.avatar,
      userName: appInstance.globalData.userInfo.nickname,
      userPhone: appInstance.globalData.userInfo.phone,
      userInfo: appInstance.globalData.userInfo
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    if(!polyfill.object.isObjectValueEqual(appInstance.globalData.userInfo, this.data.userInfo)){
        this.setData({
          userImg: appInstance.globalData.userInfo.avatar,
          userName: appInstance.globalData.userInfo.nickname,
          userInfo: appInstance.globalData.userInfo
        });
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})