// pages/home/home.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var address = require('../../utils/address.js');
var polyfill = require('../../utils/polyfill.js');
//引入灯箱组件
var Slider = require('../../template/slider/slider.js');
//引入产品Item组件
var ProductItem = require('../../template/product-item/product-item.js');
//引入产品加减部件
var CartCtrl = require('../../template/cart-ctrl/cart-ctrl.js');
//引入购物车组件
var Cart = require('../../template/cart/cart.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
// 优惠标签配色
var tagColor = util.getTagColor();
//获取app实例
var appInstance = getApp();
var dialog = [
    {
      title: '发现您的收货地址已变更',
      content: '是否保留原收货地址？',
      cancelText: '保留地址',
      confirmText: '切换地址',
      confirmColor: '#e61773',
      success: function(res){
          if (res.confirm) {
            // 切换至当前定位门店
            var _self = this,
                gpsInfo = JSON.parse(util.getStorage("gps_info"));
            if(gpsInfo){
                address.setCurrentAddress({
                    city: '',
                    city_name: '',
                    addressline: gpsInfo.location_addr,
                    address_lng: gpsInfo.lng,
                    address_lat: gpsInfo.lat,
                    hasLocationStore: 0                    
                });
                wx.redirectTo({
                    url: '../index/index' 
                });
            }
          }
      }
    }
];
//营销位配置
var cfg={1:5,2:7,3:8,4:4};
Page({
  data:{
      storeAnnouncement: '', //门店公告
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
      showProCate:false,

      // 门店数据
      storeData:{},
     

      
      //单前分类栏目所属类型index
      currentIndex: 0,
      //当前分类Id
      currentCateId: 0,
      //设置分类滚动条位置
      scrollLeft: 0,
      //产品数组
      pros:[],
      //分页信息
      pages:{},
      // 商品分类loading标识
      showLoadingFlag:[],
      //商品分类loaded标识
      showLoadedFlag: [],
      //第一次触发产品列表数据加载标志位
      firstLoadDataFlag: [],
      //swiper高度，官方限死固定高度
      swiperHeight: 40
  },
  //点击分类
  cateClick: function(e){
      this.setData({
            currentIndex: e.currentTarget.dataset.index,
            currentCateId: e.currentTarget.dataset.id
      });
      this.scrollLeftChange(e.currentTarget.dataset.index);
  },     
  //滑动产品swiper
  productSwiperScroll: function(e){
      var _self = this;
      this.setData({
            currentIndex: e.detail.current,
            currentCateId: _self.data.idxData.navbar[e.detail.current].nav_id
      });
      this.scrollLeftChange(e.detail.current);
  }, 
  //分类滚动条位置变化
  scrollLeftChange: function(index){
       var rpx = util.getRpx();
       var arr = new Array(this.data.idxData.navbar.length).fill(false);
       this.setData({
            scrollLeft: index < 4 ? 0 : index * 168 / rpx,
            showLoadingFlag: arr.fill(true, index, index+1)
       });
       if(!this.data.firstLoadDataFlag[index]){
           this.loadingProList(this.data.currentCateId,this.data.currentIndex);
           this.setData(util.dynamicSetData('firstLoadDataFlag', index, true));
       }else{
           this.changeSwiperHeight(index);
           if(this.data.pros[index]){
                this.cartCtrl.switchCartCheck(this.data.pros[index],index); //同步对应分类的购物车数据（针对同种商品可以在不同分类）
           }
       }
  },
  //点击营销位
  saleTap: function(e){
      console.log(e);
  },
  toStoreDetail: function(){
      wx.navigateTo({
        url: '../store-detail/store-detail?store_id=' + this.data.storeData.id
      })
  },
  handleShowByAddress: function(){
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
  getStoreInfo: function(){
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
            // console.log(result)
            return Promise.resolve(result);
        })
        .catch(function(e){
            return Promise.reject(e);
        });
  },
  //改变swiper的高度
  changeSwiperHeight(index){
      if(this.data.pros[index]){
            var prosLength = this.data.pros[index].length;
            this.setData({
                swiperHeight: prosLength * 282 / util.getRpx() + 40 //TODO,这种方式不好,swiper高度，官方限死固定高度
            });    
             this.setData(util.dynamicSetData('showLoadingFlag', index, false));   
      } 
  },
  // 分页加载商品列表
  loadingProList: function(cateId,index) {
        if(typeof this.data.pages[index]=='undefined'){
            //TODO，实现this.pages[index]={}
            this.setData(util.dynamicSetData('pages', index, {}));
        }
        if(typeof this.data.pages[index].page=='undefined'){
            this.setData(util.dynamicSetData('pages', index, 0, 'page'));
        }
        if(typeof this.data.pages[index].totalPage=='undefined'){      
            this.setData(util.dynamicSetData('pages', index, 1, 'totalPage'));
        }
        var page = this.data.pages[index].page;
        this.setData(util.dynamicSetData('pages', index, page+1, 'page'));

        if(this.data.pages[index].page > this.data.pages[index].totalPage) {
            this.setData(util.dynamicSetData('showLoadingFlag', index, false));   
            this.setData(util.dynamicSetData('showLoadedFlag', index, true));
            return;
        }

        this.getProductList(cateId,index).then(result=>{          
            this.setData(util.dynamicSetData('pages', index, result.data.totalPage, 'totalPage'));

            if(typeof this.data.pros[index]=='undefined'){          
                this.setData(util.dynamicSetData('pros', index, []));
            }
            var oldpros = this.data.pros[index];
            var pros = oldpros.concat(this.handleActList(result.data.goodsList));    
            this.setData(util.dynamicSetData('pros', index, pros));
            //动态改变swiper的高度
            this.changeSwiperHeight(index);
            this.cartCtrl.getCurrentProCounts(result.data.goodsList, index); 
        });
  },  
  // 获取商品列表
  getProductList: function(cateId,index){
        var _self = this;
        return util.wxRequest({
            method: 'POST',
            url: ports.goodsGoodslist,
            header: {
            'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                store_id: _self.data.storeData.id,
                nav_id: cateId,
                page: _self.data.pages[index].page
            }
        }).then(function(result) {
            return Promise.resolve(result);
        }).catch((e)=>{
            return Promise.reject(e);
        });
  },
  //门店公告控制
  changeShowStoreDetail: function(){
        var _self = this;
        this.setData({
            showStoreDetail: !_self.data.showStoreDetail
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
  //处理优惠标签（列表）
  handleActList: function(list){
        var handleAct = function(str){
            if(!str){
                return '';
            }
            var arrStr=/[减促]/.exec(str),
                tag = arrStr[0],
                colorCfg={
                    '减':'#fd1268',
                    '促':'#ffaf04'
                },
                resultColor = '#fd1268';
            if(tag in colorCfg){
                resultColor = colorCfg[tag];
            }
            return {
                resultColor: resultColor,
                tag: tag,
                str: str
            };           
        }
        if(list.length === 0){ return []; }
        return list.map(item =>{
            item.tags = item.tags.map(sitem => {
                return handleAct(sitem.name);
            });
            return item;
        });
  },
  //切分公告字符串
  splitStoreAnnouncement: function(str){
      if(str == ''){ return ''; }
      return str.split(/\n|\r\n/g);
  },
  // 设置首页数据
  setStoreData: function(idxData){
      this.slider.initData(idxData.store_info.store_picture_list); //初始化swiper图片
      var _self = this,
          cateFlagArr = new Array(idxData.navbar.length).fill(false); //初始化分类标识位数组
      //优惠标签处理
      idxData.store_info.store_activity_format = this.handleAct(idxData.store_info.store_activity_format);
      var store_activity_list = idxData.store_info.store_activity_list;
      for(let i = 0; i < store_activity_list.length; i++){
            store_activity_list[i] = this.handleAct(store_activity_list[i], i);
      }
      this.setData({
        idxData: idxData, // 首页通用数据
        storeData: idxData.store_info, // 门店信息
        saleList: idxData.module.data.slice(0,cfg[idxData.module.show_type]), // 营销位
        saleType: idxData.module.show_type,
        showProCate: idxData.navbar ? true : false,
        currentCateId: idxData.navbar[0].nav_id,
        showLoadingFlag: cateFlagArr,
        showLoadedFlag: cateFlagArr
      });

      //默认加载第一个分类的数据
      var arr = new Array(this.data.idxData.navbar.length).fill(false);
      this.setData({
         firstLoadDataFlag: arr.fill(true, 0, 1)
      });          
      this.loadingProList(this.data.currentCateId,this.data.currentIndex);

      //设置公告内容
      this.setData({
         storeAnnouncement: _self.splitStoreAnnouncement(_self.data.idxData.announcement || _self.data.storeData.announcement)
      });
      // 优先使用用户选中的address_id
      var addressId = this.data.address.address_id,
          currentAddress = util.getStorage("currentAddress");
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
      // 传递给全局变量cartData（购物车数据）
      appInstance.globalData.cartData = polyfill.object.assignIn(appInstance.globalData.cartData,{
            storeId:parseInt(storeId),
            storeName:_self.data.storeData.store_name,
            floorPrice:_self.data.storeData.floor_price,
            freeShipPrice:_self.data.storeData.free_ship_price,
            deliveryFee:_self.data.storeData.delivery_fee
      });
  },
  onReachBottom: function(){
      if(this.data.showLoadedFlag[this.data.currentIndex]){
          //该分类所以数据加载完毕
          return;
      }
      this.setData(util.dynamicSetData('showLoadingFlag', this.data.currentIndex, true));
      this.loadingProList(this.data.currentCateId,this.data.currentIndex);
  },
  onLoad:function(options){
      //初始化灯箱组件
      this.slider = new Slider(this);
      //初始化产品加减部件组件
      this.cartCtrl = new CartCtrl(this);
      //初始化购物车组件
      this.cart = new Cart(this);
      //初始化产品Item组件
      new ProductItem(this);
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
    var _self = this;
    this.cart.initCartData();
    //默认执行一次同步操作
    if(this.data.pros[this.data.currentIndex]){
        _self.cartCtrl.switchCartCheck(_self.data.pros[_self.data.currentIndex],_self.data.currentIndex);
    }
    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})