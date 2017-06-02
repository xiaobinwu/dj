// pages/region/region.js
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
//获取app实例
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchKey: '',
    searchList: [],
    hotCity: [],
    cityList: [],
    allCity: [],
    timer: null
  },
  getHotCity: function(){
    util.wxRequest({
      url: ports.cityList
    }).then((res) => {
      this.setData({
        hotCity: res.data.hot_city_list
      });
    })
  },
  getCityData: function(){
    util.wxRequest({
      url: ports.initialAddress
    }).then((res) => {
      var newData = {};
      for (var d in res.data) {
        if (res.data[d]) {
          newData[d] = res.data[d];
        }
      }
      this.setData({
        cityList: newData
      });
      this.getAllCity();
    })
  },
  getAllCity: function(){
    var olist = this.data.cityList,
        list = [];
    for (let i in olist) {
      list = list.concat(olist[i]);
    }
    this.setData({
      allCity: list
    });
  },
  searchListWithKey: function(e){
    if(e.detail.value !== ''){
      this.setData({
        searchList: this.data.allCity.filter(data => {
          return data.region_name && data.region_name.indexOf(e.detail.value) !== -1
        })
      });
    }else{
      this.setData({
        searchList: []
      });
    }
  },  
  searchRegion: function(e){
    var _self = this;
    if(this.data.timer){
      return;
    }
    //添加计时器
    function setTimer(){
     return setTimeout(function () {
        clearTimeout(_self.data.timer);
        _self.setData({
          searchList: _self.searchListWithKey(e),
          timer: null
        });
      }, 300);
    }
    this.setData({
      timer: setTimer()
    });
  },
  selectItem: function(e) {
    appInstance.globalData.geoAddress.city_name = e.currentTarget.dataset.regionName;
    this.setData({
      searchKey: ''
    });
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面对象
    prevPage.setGeoAddress && prevPage.setGeoAddress();
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHotCity();
    this.getCityData();
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