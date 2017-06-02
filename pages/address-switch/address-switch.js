// pages/address-switch/address-switch.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
var location = require('../../utils/address.js');
//获取app实例
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      // 是否显示搜索面板
      showSearch: false,
      // 地址列表
      addressList: [],
      // 当前定位数据
      currentPos: {
          addressline:'获取定位中...'
      },
      geoAddress: {},
      showPanel: false
  },
  showSearchPanel: function(e){
    this.setData({
      showPanel: true
    });
  },
  toRegion: function(e){
    wx.navigateTo({
      url: '../region/region'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
  },
  initData: function(){
    var finalAddress = JSON.parse(util.getStorage('final_address')),
      regionShowName = '请选择';
    if (finalAddress && finalAddress.region_name) {
      regionShowName = finalAddress.region_name;
    }
    appInstance.globalData.geoAddress.city_name = regionShowName;
    this.setGeoAddress();
    //定位当前位置
    this.getCurrentPos();
    //我的收货地址
    this.getAddressList();
  },
  setGeoAddress: function(){
    this.setData({
      geoAddress: appInstance.globalData.geoAddress
    });
  },
  // 定位到当前位置
  getCurrentPos: function(type){
    var _self = this;
    location.getLocation({
      token: false,
      gpsError(err) {
        // 主动触发
        if (type == 'active') {
          wx.showModal({
            title: '提示',
            content: '未获得您的设备定位服务，更多门店优惠，等您开启~~',
            showCancel: false,
            confirmColor: '#e61773'
          })
        }
      }
    }).then(result => {
      var data = result.data,
          fnData = data.final_address;
      this.setData({
        currentPos: {
          city: fnData.region_id,
          city_name: fnData.region_name,
          addressline: fnData.location_addr,
          address_lng: fnData.lng,
          address_lat: fnData.lat,
          hasLocationStore: data.has_location_store
        }
      });
      // 主动触发
      if (type == 'active') {
        this.selectAddress(this.data.currentPos, this.data.currentPos.hasLocationStore, 'currentPos');
      }
    }).catch(e => {
      console.log('switch:created:getLocation=>' + e)
    });
  },
  // 获取用户地址列表
  getAddressList: function() {
    util.getToken().then(token => {
      return util.wxRequest({
        url: ports.addressList,
        header: { 'X-Auth-Token': token, 'content-type': 'application/x-www-form-urlencoded'}
      });
    }).then(res => {
        this.setData({
          addressList: res.data
        });
    }).catch(err => {
      if (err.status === 4002) {
        wx.navigateTo({
          url: '../login/login'
        })
        return;
      }
      return wx.showToast({
        title: err,
        image: '../../image/wrong.png',
        duration: 1000
      });

    })
  },
  // 本界面选择某个地址
  selectAddress: function(add, status, type) {

    // 无法获取到定位时
    if (type == 'currentPos' && !this.data.currentPos.addressline) {
        return;
    }

    // 不支持配送情况
    if (status !== 1) {
      return wx.showModal({
        title: '提示',
        content: '该地址暂无门店支持配送，是否继续跳转？',
        confirmColor: '#e61773',
        success: function (res) {
          if (res.confirm) {
            location.setCurrentAddress(add);
            wx.redirectTo({
              url: '../index/index'
            })
          }
        }
      });
    }

    // 设置当前地址(存进本地储存)
    location.setCurrentAddress(add);

    // 跳转到首页
    wx.redirectTo({
      url: '../index/index'
    });
  },

  selectAddressEvent: function(e){
    var curresntPos = e.currentTarget.dataset.currentPos,
        sendSta = e.currentTarget.dataset.sendSta,
        type = e.currentTarget.dataset.type;
    this.selectAddress(curresntPos, sendSta, type);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})