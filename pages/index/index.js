/* 承载页 */
var app = getApp()
var bearer = require('../../utils/bearer.js');
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
Page({
  onLoad: function () {
    bearer.init();
    var ajaxCfg={
            method: 'POST',
            url: ports.getLocation,
            data:{
              lat:22.516232,
              lng:113.921143,
              location_addr: "粤海大厦",
              region_id: "77",
              region_name:"深圳市"
            }
    }
    util.wxRequest(ajaxCfg, true).then(res =>{
      console.log(res)
    })
  }
})
