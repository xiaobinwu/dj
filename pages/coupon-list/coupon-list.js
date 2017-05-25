// pages/coupon-list/coupon-list.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
//引入优惠券组件
var couponItem = require('../../template/coupon-item/coupon-item.js');
var obj = [
        {
            "id": "3644764", 
            "tag": "", 
            "type": "3", 
            "code": "T5SFVS92PC", 
            "showAimTitle": "会员尊享", 
            "showDiscountTitle": "满38元可用", 
            "showDiscountMoney": "10.00", 
            "startDate": "2017.03.14 16:15", 
            "endDate": "2017.04.13 16:15", 
            "exp_soon": 0, 
            "coupon_rule": "1、优惠券限线下门店消费时使用，每单只使用一张优惠券，不与其它优惠券叠加使用；2、优惠券不设找赎，不可兑换现金，仅限有效期内使用，打印无效；3、优惠券有效期内周末、假日通用；4、每张优惠券仅限指定门店一次性使用5、所有规则由五洲会海购依据国家相关法律法规及规章制度予以解释。", 
            "code_desc": "促销商品（限时促销、秒杀、N元N件、砍价活动及其他促销）不参与优惠券优惠", 
            "qrcodeStr": ""
        }, 
        {
            "id": "3644658", 
            "tag": "", 
            "type": "3", 
            "code": "OHLOK99TQY", 
            "showAimTitle": "门店专享", 
            "showDiscountTitle": "满20元可用", 
            "showDiscountMoney": "6.00", 
            "startDate": "2017.01.13 14:34", 
            "endDate": "2017.01.23 14:34", 
            "exp_soon": 0, 
            "coupon_rule": "1、优惠券限线下门店消费时使用，每单只使用一张优惠券，不与其它优惠券叠加使用；2、优惠券不设找赎，不可兑换现金，仅限有效期内使用，打印无效；3、优惠券有效期内周末、假日通用；4、每张优惠券仅限指定门店一次性使用；5、所有规则由五洲会海购依据国家相关法律法规及规章制度予以解释。", 
            "code_desc": "促销商品（限时促销、秒杀、N元N件、砍价活动及其他促销）不参与优惠券优惠", 
            "qrcodeStr": ""
        }
    ];

var obj1 = [
        {
            "id": "3644709", 
            "tag": "满满", 
            "type": "1", 
            "code": "FIPR6TI4YG", 
            "showAimTitle": "满10-6元", 
            "showDiscountTitle": "满10元可用", 
            "showDiscountMoney": "6.00", 
            "startDate": "2017.02.16 00:00", 
            "endDate": "2022.03.17 00:00", 
            "exp_soon": 0, 
            "coupon_rule": "1、优惠券限线下门店消费时使用，每单只使用一张优惠券，不与其它优惠券叠加使用；2、优惠券不设找赎，不可兑换现金，仅限有效期内使用，打印无效；3、优惠券有效期内周末、假日通用；4、每张优惠券仅限指定门店一次性使用；5、所有规则由五洲会海购依据国家相关法律法规及规章制度予以解释。", 
            "code_desc": "满10-6元", 
            "qrcodeStr": ""
        }
    ];




Page({
  data:{
    currentView: 1,
    codeValue: '',
    couponData: [],
    showLoadingFlag: false,
    showLoadedFlag: false,
    currPage: 0
  },
  onLoad:function(options){
    //初始化优惠券组件
    this.couponItem = new couponItem(this);    
    this.getCouponList(1);
  },
  getCodeValue: function(e){
    this.setData({
      codeValue: e.detail.value
    });
  },
  switchTab: function(e){
    var activetab = e.currentTarget.dataset.activetab;
    if(activetab != this.data.currentView){
      this.setData({
        currentView: activetab,
        currPage: 0,
        showLoadingFlag: false,
        showLoadedFlag: false,
        couponData: []
      });
      this.getCouponList(activetab);
    }
  },
  getCouponList: function(type){
    this.setData({
        currPage: ++this.data.currPage
    });
    util.getToken().then(token => {
        return util.wxRequest({
            url: ports.couponList,
            method: 'POST',
            data: { 
              page: this.data.currPage,
              online: 3,
              type: type
            },
            header: { 'X-Auth-Token': token,  'content-type': 'application/x-www-form-urlencoded'}
        })
    }).then(res => {
        this.setData({
            couponData: this.data.couponData.concat(type==3 ? obj : obj1),
            showLoadingFlag: false
        });
    }).catch((e)=>{
        console.log(e)
    });
  },
  doExchange: function(){
      if(this.data.codeValue === ''){
          wx.showToast({
              title: "您还没有输入兑换码",
              image: '../../image/wrong.png',
              duration: 1000
          });    
          return;
      }
      if(this.data.couponData.length === 0){
          wx.showToast({
              title: "您输入的优惠码不存在",
              image: '../../image/wrong.png',
              duration: 1000
          });   
          return;
      }
      util.getToken().then(token => {
          util.wxRequest({
              method: 'POST',
              url: ports.couponConversion,
              headers:{'X-Auth-Token':token, 'content-type': 'application/x-www-form-urlencoded'},
              data: {
                  pcode: this.data.codeValue
              }
          }).then((result)=> {
              return wx.showToast({
                  title: result.msg,
                  duration: 1000
              });    
          }).catch((e)=>{
              wx.showToast({
                  title: e,
                  image: '../../image/wrong.png',
                  duration: 1000
              });    
          });
      });
  },
  onReachBottom: function(){  
    if(this.data.showLoadedFlag){
        return;
    }
    this.setData({
    showLoadingFlag: true
    });
    this.getCouponList(this.data.currentView);
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