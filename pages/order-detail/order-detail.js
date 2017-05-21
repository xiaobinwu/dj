// pages/order-detail/order-detail.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
//测试对象
var obj = {
        "consignee_name": "吴绍彬",
        "consignee_mobile": "18824865543",
        "delivery_type_text": "送货到家",
        "receiving_time": "15:30-17:30",
        "consignee_address": "广东省 深圳市 南山区 深圳市南山区民政局 111",
        "order_id": 4084,
        "order_sn": "CO161219183055814700",
        "store_id": "20",
        "store_name": "永新汇店",
        "currency": "￥",
        "order_amount": "12.23",
        "add_time": "2017-02-15 15:06:48",
        "order_status": "10",
        "order_status_name": "",
        "left_time": 3600,
        "province_id": "0",
        "province_name": "广东省",
        "city_id": "0",
        "city_name": "深圳市",
        "district_id": "0",
        "district_name": "南山区",
        "addressline": "深圳出入境检测检疫局工业品检测技术中心",
        "address_lng": "113.92456055",
        "address_lat": "22.50715065",
        "progress": {
          "info": [
            {
              "icon": "create",
              "text": "已提交"
            },
            {
              "icon": "await_pay",
              "text": "待支付"
            }
            // {
            //   "icon": "paid",
            //   "text": "已支付"
            // },
            // {
            //   "icon": "picking",
            //   "text": "待配送"
            // },
            // {
            //   "icon": "shipping",
            //   "text": "配送中"
            // },
            // {
            //   "icon": "confirm_goods",
            //   "text": "已送达"
            // },
            // {
            //   "icon": "refund",
            //   "text": "已取消"
            // },
            // {
            //   "icon": "complete",
            //   "text": "已完成"
            // },
            // {
            //   "icon": "cancel",
            //   "text": "已取消"
            // }
          ],
          "last_index": 2
        },
        "button_list": [
          {
            "text": "去支付",
            "action": "to_pay",
            "is_highlight": 1
          },
          {
            "text": "再来一单",
            "action": "buy_again",
            "is_highlight": 1
          },
          {
            "text": "确认收货",
            "action": "confirm_goods",
            "is_highlight": 1
          },
          {
            "text": "取消订单",
            "action": "cancel_order",
            "is_highlight": 1
          },
          {
            "text": "取消订单",
            "action": "refund_order",
            "is_highlight": 1
          },
          {
            "text": "订单进度",
            "action": "order_progress",
            "is_highlight": 1
          },
          {
            "text": "申请售后",
            "action": "return_order",
            "is_highlight": 1
          }
        ],
        "goods_list": [
          {
            "goods_id": "1029",
            "goods_sn": "145254101",
            "goods_name": "【保税】澳洲Rebecca碟型活性羊胎素霜 50ml",
            "goods_price": "61.00",
            "goods_number": "1",
            "goods_img": "http://img01.wzhouhui.egocdn.com/goods/image_show/2016/11/25/300/35240bf972782b3221e782c35f87cd934844caab.jpg",
            "tags": [],
            "apply_status_name": "",
            "apply_status": "3"
          },
          {
            "goods_id": "1029",
            "goods_sn": "145254101",
            "goods_name": "【保税】澳洲Rebecca碟型活性羊胎素霜 50ml",
            "goods_price": "61.00",
            "goods_number": "1",
            "goods_img": "http://img01.wzhouhui.egocdn.com/goods/image_show/2016/11/25/300/35240bf972782b3221e782c35f87cd934844caab.jpg",
            "tags": [],
            "apply_status_name": "",
            "apply_status": "3"
          }
        ]
};
var obj1 = [
    {
        desc: '订单已取消',
        add_time: '2017-05-21 20:51:38'
    },
    {
        desc: '订单提交成功',
        add_time: '2017-05-21 19:51:38'
    },    
    {
        desc: '提交中',
        add_time: '2017-05-21 18:51:38'
    },    
]
Page({
  data:{
    orderData: {},
    progressData: [],
    currentView: 'detail',
    orderid: '',
    page: '',
    btnAction: '',
    reasonData: [],
    reasonDataIndex: 0,
    reasonList: {}
  },
  clipboardData: function(e){
      wx.setClipboardData({
        data: e.currentTarget.dataset.clipboard,
        success: function(res) {
            wx.showToast({
                title: '复制成功',
                icon: 'success',
                duration: 1000
            });         
        },
        fail: function(res) {
            wx.showToast({
                title: '复制功能出错',
                image: '../../image/wrong.png',
                duration: 1000
            });         
        }        
      })
  },

  
  bindPickerChange: function(e) {
    var _self = this,
        currentSn = e.currentTarget.dataset.currentSn;      
    this.setData({
        reasonDataIndex: e.detail.value
    });
    util.getToken().then(token => {
        return util.wxRequest({
            url: ports.refundOrder,
            method: 'POST',
            data: {
                order_sn: currentSn,
                reason: this.data.reasonData[this.data.reasonDataIndex],
                reason_id: this.data.reasonList[this.data.reasonData[this.data.reasonDataIndex]]
            },
            header: { 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'}
        });
    }).then(res => {
        if(res.status === 0) {
            wx.showToast({
                title: '订单取消成功',
                icon: 'success',
                duration: 1000
            });
            this.getOrderDetail();
            this.getProgressData();
            this.navigateBackFun();
        }
    }).catch(err => {
        this.getOrderDetail();
        this.getProgressData();
        this.navigateBackFun();
    })
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
                              var param = {};
                              param[data[key]] = key;
                              this.setData({
                                'reasonList': polyfill.object.assignIn(this.data.reasonList, param)
                              });
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
  orderAction: function(e){
    var _self = this,
        btn = e.currentTarget.dataset.btn,
        object = e.currentTarget.dataset.item;
        this.setData({
            btnAction: btn.action
        });
    //去支付
    if(btn.action === 'to_pay') {
        wx.navigateTo({
          url: '../pay/pay?ordersn=' + object.order_sn
        });
    }
    /**
     * 取消订单
     * @param  {[order_id]} method [订单id]
     * @return {[promise]}
     */
    if(btn.action === 'cancel_order') {
        var data = {
            orderId: object.order_id,
            reason: '微信端用户取消'
        };
        wx.showModal({
          title: '提示',
          content: btn.confirm || '确定取消该订单吗?',
          confirmColor: '#e61773',
          success: function(res) {
            if (res.confirm) {
                util.getToken().then(token => {
                  return util.wxRequest({
                        url: ports.cancelOrder,
                        method: 'POST',
                        data: data,
                        header: {'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'}
                  })
                }).then(res => {
                    if(res.status === 0) {
                        wx.showToast({
                            title: '订单取消成功',
                            icon: 'success',
                            duration: 1000
                        });
                        _self.getOrderDetail();
                        _self.getProgressData();
                        _self.navigateBackFun();
                    }else{
                        wx.showToast({
                            title: res.msg,
                            image: '../../image/wrong.png',
                            duration: 1000
                        });                       
                    }
                }).catch(err => {
                      wx.showToast({
                          title: err,
                          image: '../../image/wrong.png',
                          duration: 1000
                      });                    
                });
            } 
          }
        });        
    }

    // 确认收货
    if(btn.action === 'confirm_goods') {
        var data = {
            orderId: object.order_id
        }

        util.getToken().then(token => {
            return util.wxRequest({
                url: ports.confirmOrder,
                method: 'POST',
                data: data,
                headers: { 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'}
            })
        }).then(res => {
            if(res.status === 0) {
                wx.showToast({
                    title: '操作成功',
                    icon: 'success',
                    duration: 1000
                });
                _self.getOrderDetail();
                _self.getProgressData();
                _self.navigateBackFun();
            }else{
                wx.showToast({
                    title: res.msg,
                    image: '../../image/wrong.png',
                    duration: 1000
                });               
            }
        }).catch(err => {
            wx.showToast({
                title: err,
                image: '../../image/wrong.png',
                duration: 1000
            });    
        })
    }

    // 申请售后
    if(btn.action === 'return_order') {
        
    }

    //再来一单
    if(btn.action === 'buy_again'){
        wx.switchTab({
            url: '../home/home'
        })
    }

  },
  switchTab: function(e){
    this.setData({
      currentView: e.currentTarget.dataset.activetab
    });
  },
  getProgressData: function() {
        util.getToken().then(token => {
            util.wxRequest({
                url: ports.orderProgress,
                method: 'POST',
                data: { order_id: this.data.orderid },
                header: { 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded' }
            }).then(res => {
                this.setData({
                  progressData: obj1
                });
            })
        })
  },
  getOrderDetail: function(){
        util.getToken().then(token => {
            return util.wxRequest({
                url: ports.orderDetail,
                method: 'POST',
                data: { order_id: this.data.orderid },
                headers: { 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded' }
            }).then(res => {
                  this.setData({
                    orderData: obj
                  });
            })
        })
  },
  //返回执行上一个页面的函数,good
  navigateBackFun: function(){
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      if(prevPage.__route__.indexOf("pages/order/order") != -1) {
            prevPage.actionCallback(this.data.btnAction,this.data.page);
      }
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderid: options.orderid,
      page: options.page,
      currentView: options.view || 'detail'
    });
    this.getReasonList();
    this.getOrderDetail();
    this.getProgressData();
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