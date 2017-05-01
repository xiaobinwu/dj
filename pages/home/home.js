// pages/home/home.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var dialog = [
    {
      title: '发现您的收货地址已变更',
      content: '是否保留原收货地址？',
      cancelText: '保留地址',
      confirmText: '切换地址',
      success: function(res){
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
      }
    }
];
Page({
  data:{
      slider:{
          picList: [],
          showArr: [true, false, false, false]
      },
      // 当前地址信息
      address:{},
      showAddress:'',
      // 首页信息
      idxData:[],
      // 显示门店详情
      showStoreDetail:false,
      // 营销位
      saleList:[],
      saleType:1,

      // 显示商品某项分类
      showProCate:0,

      productHeadFixed:false,

      // 是不中显示购物车列表面板
      showCartPanel:false,
      // 门店数据
      storeData:{},
      // 购物车数据
      cartData:[],
      // 购物车综合信息
      cartBaseInfo:[],

      // 正在往下滑动 
      scrollBottomIng:false,

      // scrollView原距离顶部的距离
      oldScrollTop:0,
  },
  _sliderChange: function(e){
      var showArr = this.data.slider.showArr;
      for(let i = 0; i < showArr.length; i++){
        if(i === e.detail.current){
          showArr[i] = true;
        }
      }
      this.setData({
        'slider.showArr': showArr
      });
  },  
  handleShowByAddress(){
      var _self = this;
      // 显示地址
      this.setData({
          showAddress: _self.data.address.location_addr
      });
      // 通过地址信息获取门店信息(region_id,lat,lng)
      this.getStoreInfo().then(result=>{
          this.setStoreData(result.data);
          // this.validCartData();
      });      
  },
  // 获取门店首页信息
  getStoreInfo(){
      var _this = this,
          adr = this.data.address,
          selectStoreId = util.getStorage("select_store_id");
      return util.wxRequest({
            method: 'POST',
            url: ports.storeShow,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                store_id: selectStoreId || '',
                region_id: adr.region_id,
                lat: adr.lat,
                lng: adr.lng
            }
        }).then(function(result) {
            console.log(result)
            return Promise.resolve(result);
        })
        .catch(function(e){
            return Promise.reject(e);
        });
  },
  // 设置首页数据
  setStoreData(idxData){
      var _this = this;

      this.setData({
        idxData: idxData, // 首页通用数据
        storeData: idxData.store_info, // 门店信息
        saleList: idxData.module.data, // 营销位
        saleType: idxData.module.show_type,
        showProCate: idxData.cates[0].cate_id,// 商品分类默认第一项
        'slider.picList': idxData.store_info.store_picture_list //初始化swiper图片
      })
      // 优先使用用户选中的address_id
      var addressId = this.data.address.address_id,                                      currentAddress = util.getStorage("currentAddress");
      if(currentAddress){
          currentAddress = JSON.parse(currentAddress);
          addressId = currentAddress.address_id;
      }

      // 门店id
      var storeId = this.data.storeData.id;

      // 将当前选中的门店信息存入本地
      util.setStorage("current_store_info",JSON.stringify({
          address_id: addressId,
          store_id: storeId
      }));

      // 传递给vuex-cart
      // store.dispatch('updateCartData', {
      //     cartData: {
      //         storeId:storeId,
      //         storeName:_this.storeData.store_name,
      //         floorPrice:_this.storeData.floor_price,
      //         freeShipPrice:_this.storeData.free_ship_price,
      //         deliveryFee:_this.storeData.delivery_fee
      //     }
      // });
  },
  onLoad:function(options){
      /**
       * 1.拿到处理过的地址信息 final_address
       * 2.通过地址信息获取门店信息(region_id,lat,lng)
       * 3.将门店信息数据设置(填充)
       * 3.通过门店信息中商品分类，将分类第一项传递给ProductList.vue
       */
      var finalAddress = util.getStorage("final_address");
      if(finalAddress){
          //拿到处理过的地址信息 finalAddress
          this.setData({
              address: JSON.parse(finalAddress)
          });
          this.handleShowByAddress();
      }
      /**
       * 1.获取到页面分发信息，如果page为1且popType大于0说明要弹层处理
       * 2.弹层
       */
      var pageSwitchInfo = util.getStorage("page_switch_info");
      if(pageSwitchInfo){
          // 拿到分发页面信息
          pageSwitchInfo = JSON.parse(pageSwitchInfo);
          // 清空分发配置
          util.removeStorage("page_switch_info");
          // 弹层
          if((pageSwitchInfo.page == 1) && ( pageSwitchInfo.popType == 1)){
              dialog[switchInfo.popType-1].cancelColor = "#666666";
              dialog[switchInfo.popType-1].confirmColor = "#666666";
              wx.showModal(dialog[switchInfo.popType-1]);
          }
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