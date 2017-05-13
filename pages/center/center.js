// pages/account/account.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
//获取app实例
var appInstance = getApp();
Page({
  data:{
    isLogin: false,
    userImg: null,
    userName: null,
    userInfo: {}
  },
  goDetail: function(){
    if(this.data.isLogin){
        wx.navigateTo({
          url: '../user-detail/user-detail'
        });
    }else{
        wx.navigateTo({
          url: '../login/login'
        });
    }
  },
  getInfo: function(){
    var _self = this;
    util.getToken().then(token => {
      return util.wxRequest({
          url: ports.userInfo,
          header: { 'X-Auth-Token': token }
      })
    }).then((res) => {
        _self.setData({
          isLogin: true
        });
        res.data.hasData = true;
        // 传递给全局变量cartData（购物车数据）
        appInstance.globalData.userInfo = polyfill.object.assignIn(appInstance.globalData.userInfo, res.data);
        _self.setData({
          userImg: appInstance.globalData.userInfo.avatar,
          userName: appInstance.globalData.userInfo.nickname,
          userInfo: appInstance.globalData.userInfo
        });
    }).catch(err => {
        if(err.status === 4002) {
            wx.navigateTo({
              url: '../login/login'
            });
        }
    })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.getInfo();
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