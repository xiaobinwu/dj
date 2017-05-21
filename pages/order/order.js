// pages/order/order.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
var Countdown = require('../../utils/countDown.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 

//测试对象
var obj = {
  "code": 0,
  "msg": "门店订单列表接口",
  "cmd": "",
  "uid": 37485,
  "time": 1487142408,
  "data": {
    "pagination": {
      "totalCount": 1,
      "totalPage": 1,
      "curPageNo": 1,
      "pageSize": 10
    },
    "order_list": [
      {
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
      }
    ]
  },
  "from_ip": "127.0.0.1"
};

Page({
  data:{
    orderList: [],
    reasonData: [],
    reasonDataIndex: 0,
    reasonList: {},
    showLoadingFlag: false,
    showLoadedFlag: false,
    hasOrder: true,
    currPage: 0,
    totalPage: 1,
    pages: [],
    clockFlags: []
  },
  getOrderList(index) {
        if(!index) {
            this.setData({
                currPage: this.data.currPage++
            });
        }
        if(this.data.currPage > this.data.totalPage) {
            this.setData({
                showLoadedFlag: true,
                showLoadingFlag: false
            });
            return;
        }

        util.getToken().then(token => {
            return util.wxRequest({
                url: ports.orderList,
                method: 'POST',
                data: { page: index ? index:  this.data.currPage },
                header: { 'X-Auth-Token': token,  'content-type': 'application/x-www-form-urlencoded'}
            })
        }).then(res => {
            // this.currPage = res.data.pagination.curPageNo

            res = obj; //测试对象


            this.setData({
                totalPage: res.data.pagination.totalPage
            });
            if(this.data.totalPage === 0){
                this.setData({
                    hasOrder: false
                });
                return;
            }
            var pages = this.data.pages;
            if(index) {
                pages.splice(index-1, 1, res.data.order_list);
            }else {
                pages.push(res.data.order_list);
                this.setData({
                    showLoadingFlag: false
                });
            }
            this.setData({
                pages: pages
            });
            //清除计时器
            this.clearTimer();
            this.handleList();
        }).catch(err => {
            if(err.status === 4002) {
                wx.navigateTo({
                    url: '../login/login'
                });
            }
        })
  },
  //同个页面多个计时器，需要每次更换数据时，清掉上一个计时器标志数组
  clearTimer: function(){
    var clockflags = this.data.clockFlags;
    for(let i = 0; i < clockflags.length; i++){
        clearInterval(clockflags[i]);
    }
  },
  onReachBottom: function(){  
    if(this.data.showLoadedFlag){
        return;
    }
    this.setData({
    showLoadingFlag: true
    });
    this.getOrderList();
  },
  handleList: function(){
    var list = [], val = this.data.pages;
    for(let i = 0; i< val.length; i++) {
        for(let j = 0; j < val[i].length; j++) {
            val[i][j].page = i + 1;
            val[i][j].clock = '';
            var len = list.push(val[i][j]);
        }
    }
    this.setData({
        orderList: list
    });
    this.doCountDwon();
  },
  doCountDwon: function(){
    var list = this.data.orderList, _self = this;
    for(let i = 0; i < list.length; i++){
        if(list[i].left_time !== 0){  
            var timer = new Countdown({
                context: this,
                second: list[i].left_time*1000,
                endText: '',
                isCustom: true,
                customDataName: 'orderList[' + i + '].' + 'clock',
                index: i,
                start: function(flag){
                    //保存计时器标志
                    var clockflags = _self.data.clockFlags;
                    clockflags.push(flag);
                    _self.setData({
                        clockFlags: clockflags
                    });
                },
                done: function(options){
                    //处理后倒计时后，是否需要改变icon
                    console.log(options.index);
                }
            })
            timer.run();
        }else{
            continue;
        }
    }
  },
  goDetail: function(e){
    wx.navigateTo({
        url: '../order-detail/order-detail?orderid=' + e.currentTarget.dataset.orderId + '&page=' + e.currentTarget.dataset.resetPage
    });
  },
  bindPickerChange: function(e) {
    var _self = this,
        resetPage = e.currentTarget.dataset.resetPage,
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
            this.getOrderList(resetPage);
        }
    }).catch(err => {
        this.getOrderList(resetPage);
    })
  },
  actionCallback: function(method, index) {
      if(method === 'cancel_order' || method === 'confirm_goods') {
          this.getOrderList(index);
      }
  },
  orderAction: function(e){
    var _self = this,
        btn = e.currentTarget.dataset.btn,
        object = e.currentTarget.dataset.item;
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
                        _self.actionCallback(btn.action, object.page);
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
                _self.actionCallback(btn.action, object.page);
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

    // 订单进度
    if(btn.action === 'order_progress') {
        wx.navigateTo({
          url: '../order-detail/order-detail?orderid=' + object.order_id + '&view=progress&page='+ object.page 
        });
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
  initData: function(){
    this.getReasonList();
    this.getOrderList(); //默认加载第一页
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.initData();
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