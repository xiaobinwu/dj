// pages/detail/detail.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var polyfill = require('../../utils/polyfill.js');
var address = require('../../utils/address.js');
var cart = require('../../utils/cart.js');
var Countdown = require('../../utils/countDown.js');
//引入灯箱组件
var Slider = require('../../template/slider/slider.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
//引入产品加减部件
var CartCtrl = require('../../template/cart-ctrl/cart-ctrl.js');
//引入购物车组件
var Cart = require('../../template/cart/cart.js');
//获取app实例
var appInstance = getApp();
var rpx = util.getRpx();
Page({
  data:{
      showCart:false,
      allData:{},
      goodsData:{},
      goodsId:0,
      cartBaseInfo:[],
      storeData:[],
      currentStoreInfo:{},
      storeId:20,
      address:{},
      clock: '',
      goodsDesc: [],
      goodsDescSize: [],
      isNotComputedCurrentProCounts: true
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
  addToCart: function(){
    var 
        dSta = this.data.storeData.delivery_sta,
        staCfg={
            2:'不在配送时间内，不可购买',
            3:'不在配送范围内，不可购买'
        };
    if(dSta in staCfg){
        return wx.showToast({
            title: staCfg[dSta],
            duration: 1000
        });
    }
    cart.cartCountChange(this.data.goodsData,'add').then(result => {
        this.cart.resetCartData();
    });      
  },
  //获取当前位置信息
  getAddressInfo: function(){
    return new Promise((resolve,reject)=>{
        var finalAddress = util.getStorage("final_address");
        if(finalAddress){
            resolve(JSON.parse(finalAddress));
        }else{
            address.getCoords().then(gps=>{
                resolve(gps)
            }).catch(e=>{
                reject(e);
            })
        }
    });   
  },
  // 获取商品详情信息
  getData: function(){
    var _self = this;
    return util.wxRequest({
        method: 'POST',
        url: ports.goodsDetail,
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
            store_id: _self.data.storeId,
            goodsId: _self.data.goodsId,
            lat: _self.data.address.lat,
            lng: _self.data.address.lng
        }
    }).then(function(result) {
        return Promise.resolve(result);
    })
    .catch(function(e){
        return Promise.reject(e);
    })
  },
  getSrc: function(str){
    //1，匹配出图片img标签（即匹配出所有图片），过滤其他不需要的字符
    //2.从匹配出来的结果（img标签中）循环匹配出图片地址（即src属性）
    //匹配图片（g表示匹配所有结果i表示区分大小写）
    var imgReg = /<img.*?(?:>|\/>)/gi,
        srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i,
        arr = str.match(imgReg),
        arrTemp = [];
    for (var i = 0; i < arr.length; i++) {
        var src = arr[i].match(srcReg);
        arrTemp.push(src[1]);
    }
    return arrTemp;
  },
  onLoad:function(options){
    //初始化灯箱组件
    this.slider = new Slider(this);
    //初始化产品加减部件组件
    this.cartCtrl = new CartCtrl(this);
    //初始化购物车组件
    this.cart = new Cart(this);
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
    // 获取当前商品信息
    this.getAddressInfo().then(gps=>{
        this.setData({
            address: { 
                lat: gps.lat,
                lng: gps.lng
            }
        });
        return this.getData();

    }).then(result=>{
        var _self = this,allData = result.data;
        // 当前商品信息
        allData.goodsInfo.goods_id = this.data.goodsId;
        this.setData({
            goodsData: allData.goodsInfo,
            goodsDesc: _self.getSrc(allData.goodsInfo.goods_desc)
        });
        // console.log(allData.goodsInfo)
        this.slider.initData(allData.goodsInfo.pictures);    
        if(allData.goodsInfo.miaosha && allData.goodsInfo.miaosha.left_time > 0){
            var _self = this;
            new Countdown({
                context: this,
                second: allData.goodsInfo.miaosha.left_time*1000,
                endText: '优惠已经截止',
                done: function(options){
                    _self.setData({
                        'goodsData.miaosha.left_time': 0
                    });
                }
            }).run();
        }

    }).catch(e=>{
        console.warn(e);
    });

  },
  // image组件无法自动auto，解决方式
  loadimage: function(e){
    var descSize;
    // console.log(e.currentTarget.dataset.index)
    descSize = {
        opacity: 1,
        width: 750 / rpx,
        height: (750 / rpx) * e.detail.height / e.detail.width
    };
    this.setData(util.dynamicSetData('goodsDescSize', e.currentTarget.dataset.index, descSize));
  },
  onReady:function(){
    // 页面渲染完成
  },    
  onShow:function(){
    // 页面显示
    this.cart.initCartData();
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})