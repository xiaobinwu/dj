//index.js
//获取应用实例
var app = getApp()

// 引入SDK核心类
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
 
// 实例化API核心类
var demo = new QQMapWX({
    key: 'LHVBZ-DQVWW-C2YRC-REKYI-HRUV7-JPFYV' // 必填
});
 

Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    });

    // // 调用接口
    // demo.reverseGeocoder({
    //     location: {
    //         latitude: 39.984060,
    //         longitude: 116.307520
    //     },
    //     success: function(res) {
    //         console.log(res);
    //     },
    //     fail: function(res) {
    //         console.log(res);
    //     },
    //     complete: function(res) {
    //         console.log(res);
    //     }
    // });

    wx.request({
      url: 'https://www.wzhouhui.com/dj/Location/getLocation', //仅为示例，并非真实的接口地址
      method: 'post',
      data: {
        lng: '116.307520' ,
        lat: '39.984060'
      },
      success: function(res) {
        console.log(res)
      }
  });

  }
})
