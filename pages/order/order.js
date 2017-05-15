// pages/order/order.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
Page({
  data:{
    orderList: [],
    reasonData: [],
    reasonList: {},
    showLoadingFlag: false,
    showLoadedFlag: false,
    hasOrder: false
  },
  getReasonList: function() {
      return new Promise((resolve, reject) => {
          if(this.data.reasonData.length === 0) {
              util.wxRequest({
                  url: ports.orderMsgBox,
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },                 
                  data: { msg_type: 4 }
              }).then(res => {
                  if(res.status === 0) {
                      var listData = [];
                      for(let i = 0; i < res.data.msg_list.length; i++) {
                          var item = {};
                          var data = res.data.msg_list[i];
                          for(let key in data) {
                              this.setData(util.dynamicSetData('reasonList',data[key], key));
                              listData.push(data[key]);
                          }

                      }
                      this.setData({
                        'reasonData': listData
                      });
                      resolve(this.data.reasonList);
                  }else {
                      reject('获取订单列表出错，请找客服处理~');
                  }
              })
          }else {
              resolve(this.data.reasonData);
          }
      }) 
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.getReasonList();
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