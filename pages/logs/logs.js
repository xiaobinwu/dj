//logs.js
var util = require('../../utils/util.js')
Page({
  data: {
    logs: [],
    logText: []
  },
  onLoad: function (options) {
    console.log(options);
    var arr = [];
    for(var key in options){
      arr.push({idx: key, opt: options[key]});
    }
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      }),
      logText: arr
    })
  }
})
