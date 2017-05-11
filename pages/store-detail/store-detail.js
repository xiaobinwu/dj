// pages/store-detail/store-detail.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
//引入灯箱组件
var Slider = require('../../template/slider/slider.js');
// 优惠标签配色
var tagColor = util.getTagColor();
Page({
  data:{
      couponData: {},
      store_id: 0,
      // 门店数据
      storeData: {},
      // 购物车数据
      cartData: [],
      show2: true
  },
  phoneCal: function(e){
      var phone = e.currentTarget.dataset.phone;
      wx.makePhoneCall({
        phoneNumber: phone
      });
  },
  // 处理优惠标签（优惠信息）
  handleAct: function(str,index){
        if(!str){
            return '';
        }
        var arrStr=str.split(/[:：]/),
            tag=arrStr[0].replace(/[\[\]]/g,''),
            tagStr=arrStr[1];
        return {
            backgroundColor: tagColor[index % tagColor.length],
            tag: tag,
            tagStr: tagStr
        };
  },  
  getData: function(){
      var _self = this,
          token = util.getStorage("token"),
          ajaxCfg={
              method: 'POST',
              url: ports.storeDetail,
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data:{
                  id: _self.data.store_id
              }
          };

      if(token){
          ajaxCfg.header = polyfill.object.assignIn(ajaxCfg.header, {
              'X-Auth-Token':token    
          });
      }
          
      util.wxRequest(ajaxCfg).then((result)=> {
          console.log(result);
          var couponList = result.data.promotion_code_list.list;
          couponList.forEach((cpn)=>{
              cpn.isexpend = false;
          });
          this.slider.initData(result.data.store_info.store_picture_list); //初始化swiper图片
          var store_activity_list = result.data.store_info.store_activity_list;
          for(let i = 0; i < store_activity_list.length; i++){
                 result.data.store_info.store_activity_list[i] = this.handleAct(store_activity_list[i], i);
          }
          this.setData({
            couponData: couponList,
            storeData: result.data.store_info
          });
          console.log(this.data.couponData);
          return Promise.resolve(result);
      }).catch((e)=>{
          return Promise.reject(e);
      });
  },
  onLoad:function(options){
    //初始化灯箱组件
    this.slider = new Slider(this);
    this.setData({
      store_id: options.store_id
    });
    this.getData();
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