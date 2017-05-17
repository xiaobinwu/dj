// pages/more/more.js
var polyfill = require('../../utils/polyfill.js')
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
//引入灯箱组件
var Slider = require('../../template/slider/slider.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
// 优惠标签配色
var tagColor = util.getTagColor();
var dialog = [
    {
      title: '未获得定位服务',
      content: '更多门店优惠等您开启~~',
      showCancel: false,
      confirmText: '确定'
    },
    {
      title: '未获得定位服务',
      content: '但发现您有可支持配送的地址',
      cancelText: '继续浏览',
      confirmText: '切换地址',
      confirmColor: '#e61773',
      success: function(res){
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
      }
    },
    {
      title: '当前城市暂未开通五洲门店服务',
      content: '是否更换城市查看',
      cancelText: '继续浏览',
      confirmText: '更换城市', 
      confirmColor: '#e61773',
      success: function(res){
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
      }
    },
    {
      title: '您有可支持配送的地址',
      content: '是否切换至该收货地址？',
      cancelText: '不切换',
      confirmText: '切换',
      confirmColor: '#e61773',
      success: function(res){
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
      }
    }
];
// 获取地区列表
var regionList = util.getStorage('regionList');
if(regionList){
    regionList = JSON.parse(regionList);
}
Page({
  data:{
      // 全国门店数据
      allStoreData: [],
      // 更多门店数据
      storeMoreData:{},
      // 收货/定位地址
      finalAddress:{},
      // 标识：来自地址选择
      addressSelect:false,
      // 省列表
      provincesData: [],
      // 市列表
      // citysData: [],
      // 选中的省
      selectedProvince: 6,
      // 选中的市
      selectedCity: 0,
      // 经度
      lng: 113.915669,
      // 纬度
      lat: 22.514068,
      showAddress:'',
      showCurrentStoreList:true
  },
  computed: function(){
      var _self = this;
      this.setData({
          provincesData: regionList.filter(item=>{
              return !item.parent;
          })
      });
  },
  itemProvClick(event){
      var  provId = this.data.provincesData.filter(item=>{
               return item.name == (event.target.dataset.regionName || event.currentTarget.dataset.regionName);
          })[0].value;
      this.getData({
          province_id: provId,
          city_id:0,
          flag:0
      });
  },
  //去门店详情页
  toStoreDetail(event){
        console.log(event)
  },
  //获取门店数据
  getData: function(data){
      var _self = this, 
          sdata = {
              province_id: this.data.selectedProvince,
              city_id: this.data.selectedCity,
              lng: this.data.lng,
              lat: this.data.lat,
              page: 1,
              flag: 1         
          };
      sdata = polyfill.object.assignIn(sdata,data);
      util.wxRequest({
          method: 'POST',
          url: ports.storeMore,
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: sdata
      }).then(result =>{
          var data = result.data;
          if(sdata.flag == 1){
            //获取全国数据
            _self.setData({
                allStoreData: data.storeDistribution
            });
          }
          //整理标签颜色
          for(let i = 0; i < data.store_list.length; i++){
              var store_item = data.store_list[i];
              for(let j = 0; j < store_item.store_activity_list.length;j++){
                    store_item.store_activity_list[j] = _self.dTag(store_item.store_activity_list[j],j);
              }
          }
          // 门店列表数据
          _self.setData({
              storeMoreData: data.store_list
          });       
      }).catch((e)=>{
          wx.showToast({
              title: '获取数据失败',
              duration: 2000
          }); 
      });
  },
  dTag:function(tag, index){
        var tagName=/^\[(.)\]/.exec(tag)[1];
        // 循环使用颜色
        return [tagName,tagColor[index%tagColor.length]];
  },
  onLoad:function(options){
      this.slider = new Slider(this);
      this.slider.initData([
            'https://img02.wzhouhui.net/optm/ad/2017/03/08/orig/e22542db46cefea5dfb51f7c7ba8d3817824e65c.jpg',
            'https://img02.wzhouhui.net/optm/ad/2017/03/08/orig/610d7f02a200cdb27b005b4d5cb2b67f2e6314d0.jpg',
            'https://img02.wzhouhui.net/optm/ad/2017/03/08/orig/05f531fa8b97da6987153b20ca71f3844c56e62a.jpg',
            'https://img02.wzhouhui.net/optm/ad/2017/03/08/orig/d51c19b84bbc45a8d15b460fcd6ae99768527638.jpg'
      ]);
      var _self = this,
          // 本地缓存中有地址信息时
          finalAddress = util.getStorage('final_address');
      this.computed();
      if(finalAddress){
          var tempfinalAddress = JSON.parse(finalAddress);
          this.setData({
              finalAddress: tempfinalAddress,
              showAddress: tempfinalAddress.location_addr || '定位失败'
          });
          try{
              this.setData({
                  addressSelect: true,
                  selectedProvince: regionList.filter(item=>{
                      return item.value == _self.data.finalAddress.region_id;
                  })[0].parent,
                  selectedCity: _self.data.finalAddress.region_id,
                  lng: _self.data.finalAddress.lng,
                  lat: _self.data.finalAddress.lat
              });              
          }catch(e){
              // 当定位的城市不在有门店的城市列表中时
              this.setData({
                  showCurrentStoreList: false
              });
          }
    }
    this.getData();
    // 来自页面分发
    var switchInfo = util.getStorage("page_switch_info");
    if(switchInfo){
        switchInfo=JSON.parse(switchInfo);
        // 清空分发配置
        util.removeStorage("page_switch_info");
        if(switchInfo.popType){
            dialog[switchInfo.popType-1].cancelColor = "#666666";
            dialog[switchInfo.popType-1].confirmColor = "#666666";
            wx.showModal(dialog[switchInfo.popType-1]);
        }
    }
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
  },  
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){

  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})