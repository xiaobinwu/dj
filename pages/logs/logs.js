//logs.js
var util = require('../../utils/util.js')
Page({
  data: {
    logs: [],
    logText: []
  },
  onLoad: function (options) {
    console.log(options);
    var a = [];
    for(var key in options){
      a.push(key);
    }
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      }),
      logText: a
    })
  }
})
