//app.js
App({
  onLaunch: function (options) {
    
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:{
        avatar: null,
        nickname: '',
        phone: '',
        hasData: false 
    },
    //geo page address
    geoAddress: {
      province: null,
      city: null,
      district: null,
      province_name: null,
      city_name: null,
      district_name: null,
      addressline: null,
      address_lng: null,
      address_lat: null,
      hasLocationStore: null
    },
    //购物车数据
    cartData:{
        list:[],
        totalCount:1,
        totalPrice:0,

        // 起送价
        floorPrice:0,

        // 总价达到此价免配送费
        freeShipPrice:0,

        // 运费
        deliveryFee:0,

        storeId:0,
        storeName:''
    }
  }
})