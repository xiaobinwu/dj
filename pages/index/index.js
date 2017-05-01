/* 承载页 */
var app = getApp()
var bearer = require('../../utils/bearer.js');
var util = require('../../utils/util.js');
var ports = require('../../utils/ports.js');
Page({
  onLoad: function () {
    bearer.init();
  }
})
