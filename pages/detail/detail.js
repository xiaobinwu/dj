// pages/detail/detail.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
//获取app实例
var appInstance = getApp();
Page({
  data:{
      showCart:false,
      allData:{},
      goodsData:{},
      goodsId:0,
      goodsDescHtml:'',
      cartData:[],
      cartBaseInfo:[],
      storeData:[],
      currentStoreInfo:{},
      storeId:20,
      storeIsOpen:false,
      address:{}
  },
 getStoreDetail: function(storeId){
      var 
          lng='',
          lat='',
          addressInfo = util.getStorage("final_address");

      if(addressInfo){
          addressInfo = JSON.parse(addressInfo);
          lng= addressInfo.lng;
          lat= addressInfo.lat;
      }

      var
          token = util.getStorage("token"),
          ajaxCfg={
              method: 'POST',
              url: ports.storeDetail,
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                  lng: lng,
                  lat: lat,
                  id: storeId
              }
          };

      if(token){
          ajaxCfg.header = polyfill.object.assignIn(ajaxCfg.header, {'X-Auth-Token':token});
      }

      return new Promise((resolve,reject)=>{
          util.wxRequest(ajaxCfg).then((result)=> {
              var storeData = result.data.store_info;
              // 传递给全局变量cartData（购物车数据）
              appInstance.globalData.cartData = polyfill.object.assignIn(appInstance.globalData.cartData,{
                      storeId: storeData.id,
                      storeName: storeData.store_name,
                      floorPrice: storeData.floor_price,
                      freeShipPrice: storeData.free_ship_price,
                      deliveryFee: storeData.delivery_fee
              });
              resolve(result);
          }).catch((e)=>{
              reject(e);
          });
      });
  },

  onLoad:function(options){
    var _self = this;
    //当前商品Id
    this.setData({
        goodsId: options.id,
        currentStoreInfo: util.getStorage('current_store_info')
    });
    // 当前门店ID
    if(this.data.currentStoreInfo && JSON.parse(this.data.currentStoreInfo)){
        this.setData({
            currentStoreInfo: JSON.parse(this.data.currentStoreInfo)
        });
        this.setData({
            storeId: this.data.currentStoreInfo.store_id
        });

        // 获取门店详情（用于购物车处）
        this.getStoreDetail(this.data.storeId).then(storeDetail=>{
            this.setData({
                storeData: storeDetail.data.store_info
            });
        }).catch(e=>{
            console.warn(e);
        })
    }

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