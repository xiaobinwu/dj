// pages/coupon-detail/coupon-detail.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
var obj = {
        "id": "3644709", 
        "tag": "满满", 
        "type": 1, 
        "code": "FIPR6TI4YG", 
        "showAimTitle": "满10-6元", 
        "showDiscountTitle": "满10元可用", 
        "showDiscountMoney": "6.00", 
        "startDate": "2017.02.16 00:00", 
        "endDate": "2022.03.17 00:00", 
        "exp_soon": 0, 
        "coupon_rule": "1、优惠券限线下门店消费时使用，每单只使用一张优惠券，不与其它优惠券叠加使用；\n2、优惠券不设找赎，不可兑换现金，仅限有效期内使用，打印无效；\n3、优惠券有效期内周末、假日通用；\n4、每张优惠券仅限指定门店一次性使用；\n5、所有规则由五洲会海购依据国家相关法律法规及规章制度予以解释。", 
        "code_desc": "满10-6元", 
        "qrcodeStr": "364470900000367350000009649"
    }
Page({
  data:{
    cpn: {},
    isUsed: false,
    codeId: 0
  },
  getDate: function(dateStr){
      //iphone下new Date()有bug
      return dateStr.split(' ')[0];
  },
  getCouponDetail: function(){
        util.getToken().then(token => {
            util.wxRequest({
                method: 'post',
                url: ports.couponDetail,
                headers:{'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'},
                data:{
                    codeId: this.data.codeId
                }
            }).then((result)=> {
                result.data = obj; //测试
                result.data.startDate = this.getDate(result.data.startDate);
                result.data.endDate = this.getDate(result.data.endDate);
                result.data.coupon_rule = result.data.coupon_rule.replace(/\n/g,'<br/>');
                result.data.code_desc = result.data.code_desc.replace(/\n/g,'<br/>');
                this.setData({
                  isUsed: result.data.type===2 ? true : false,
                  cpn: result.data
                });
            }).catch((e)=>{
                console.log(e)
            });
        });
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      codeId: options.codeId
    });
    this.getCouponDetail();
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