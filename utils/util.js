function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

wx.getSystemInfo({
  success: function(res) {
    console.log(res.model)
    console.log(res.pixelRatio)
    console.log(res.windowWidth)
    console.log(res.windowHeight)
    console.log(res.language)
    console.log(res.version)
    console.log(res.platform)
  }
})

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/* store封装 */
function getStorage(key, isSync=true){
  if(isSync){
      try {
        var value = wx.getStorageSync(key);
        if (value) {
          return value;
        }
      } catch (e) {
          wx.showToast({
            title: e,
            duration: 2000
          }); 
      }
  }else{
      wx.getStorage({
        key: key,
        success: function(res) {
            return res.data;
        },
        fail: function(){
            return '';
        } 
      });
  }
}
function removeStorage(key, isSync=true){
  if(isSync){
      try {
        wx.removeStorageSync(key);
      } catch (e) {
        wx.showToast({
          title: e,
          duration: 2000
        }); 
      }
  }else{
      wx.removeStorage({
        key: key,
        success: function(res) {
          console.log(res.data)
        } 
      });
  }
}


module.exports = {
  formatTime: formatTime,
  getStorage: getStorage,
  removeStorage: removeStorage

}
