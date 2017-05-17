// pages/list/list.js
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
      title: '您有可支持配送的地址',
      content: '是否切换至该收货地址？',
      cancelText: '保留地址',
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
      title: '当前地址无可配送的门店',
      content: '是否更换收货地址？',
      cancelText: '继续浏览',
      confirmText: '选择地址', 
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
Page({
  data:{
      storeData: {},
      showAddress: '',
      finalAddress: '',
      lng: 0,
      lat: 0,
      gpsInfo:{}
  },
  // 获取门店列表
  getStoreList(){
      var _self = this;
      return util.wxRequest({
            method: 'POST',
            url: ports.storeSearch,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                region_id: _self.data.finalAddress.region_id,
                lat: _self.data.finalAddress.lat,
                lng: _self.data.finalAddress.lng    
            }
        }).then(result => {
            return Promise.resolve(result);
        }).catch(e => {
            return Promise.reject(e);
        });
  },
  dTag:function(tag, index){
        var tagName=/^\[(.)\]/.exec(tag)[1];
        // 循环使用颜色
        return [tagName,tagColor[index%tagColor.length]];
  },
  onLoad:function(options){
      //初始化灯箱组件
      this.slider = new Slider(this);
      var finalAddress = util.getStorage('final_address');
      if(finalAddress){
          var tempfinalAddress = JSON.parse(finalAddress);
          this.setData({
              finalAddress: tempfinalAddress,
              showAddress: tempfinalAddress.location_addr || '定位失败'
          });
          this.getStoreList().then(result=>{
              var picList = result.data.banner_list.map(function(item){
                  return item.imgUrl;
              });
              //整理标签颜色
              for(let i = 0; i < result.data.store_list.length; i++){
                  var store_item = result.data.store_list[i];
                  for(let j = 0; j < store_item.store_activity_list.length;j++){
                        store_item.store_activity_list[j] = this.dTag(store_item.store_activity_list[j],j);
                  }
              }
              this.setData({
                storeData: result.data
              });
              this.slider.initData(picList);
          })
      }
      // 来自顶页面分发（确定使用哪种弹窗提示）
      var switchInfo = util.getStorage("page_switch_info");
      if(switchInfo){
          switchInfo = JSON.parse(switchInfo);
          // 清空分发配置
          util.removeStorage("page_switch_info");
          if(switchInfo.popType){
              dialog[switchInfo.popType-1].cancelColor = "#666666";
              dialog[switchInfo.popType-1].confirmColor = "#666666";
              wx.showModal(dialog[switchInfo.popType-1]);
          }
      }
  },
  toStoreDetail(e){
      console.log(e);
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
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