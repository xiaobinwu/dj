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


/* api接口promise 柯里化*/
var Promise = require('../lib/es6-promise.min.js'); 
function wxPromisify(fn) {  
  return function (obj = {}) {    
    return new Promise((resolve, reject) => {      
      obj.success = function (res) {        
        resolve(res);      
      }      
      obj.fail = function (res) {        
        reject(res);      
      }      
      fn(obj);    
    })  
  }
}

/* token获取封装 */
var domain = 'https://m.wzhouhui.com';
var url = {
    getOpenId: domain + '/wx/o2o_oauth',
    getToken: domain + '/mp/jwtToken'
};
function getOpenId() {
    //微信小程序没有会话管理，因此没有cookie，openId后期需要通过接口获取，openid_sign使用永久储存，代码参考：
    // var openId = localStorage.getItem('openid_sign');
    var openId = 'owaFqt9r9p2C_Mc-USOCH-N42lz8';
    return new Promise((resolve, reject) => {
        if(openId) {
            resolve();
        }else {
            removeStorage('token'); 
            wx.login({
                success: function(res) {
                    if (res.code) {
                        //发起网络请求,后期看需要promise化不？
                        wx.request({
                            url: url.getOpenId,
                            data: {
                                code: res.code
                            },
                            success: function(res) {
                                console.log(res.data);
                                localStorage.setItem('openid_sign', res.data.openid_sign);
                            }
                        });
                    } else {
                        wx.showToast({
                            title: '获取用户登录态失败！' + res.errMsg,
                            duration: 2000
                        }); 
                    }
                }
            });


        }
    });
}

function updateToken() {
    var token = '';
    return getOpenId().then(() => {
        return wxRequest({
           url: url.getToken
        });
    }).then((res) => {
        var data = res.data;
        if(data.status === 0) {
            token = data.data.token;
            setStoreage('token', token);
            return Promise.resolve(token);
        }else {
            setStoreage('token', '0');
            token = 0;
            return Promise.reject({
                status: data.status,
                msg: data.msg,
                from: 'updateToken'
            });
        }
    });
}

function getToken() {
    var token = '';
    // return getOpenId().then(() => {
    //     token = getStorage('token');
    //     if(token) {
    //         if(token === '0') {
    //             return Promise.reject({
    //                 status: 4002,
    //                 msg: '账号未绑定过手机号码'
    //             })
    //         }else {
    //             return Promise.resolve(token);
    //         }
    //     }else {
    //         return updateToken();
    //     }
    // });

    return getOpenId().then(() => {
        token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwOlwvXC93d3cud3pob3VodWkuY29tIiwiYXVkIjoiaHR0cDpcL1wvd3d3Lnd6aG91aHVpLmNvbSIsImlhdCI6MTQ5MzE3NDU0MCwibmJmIjoxNDkzMTc0NTQwLCJleHAiOjE0OTM3NzkzNDAsInN1YiI6IjM3ODU2In0.BD_WHZ8TK3dgQNr5pc9LD4uZVB1MWNz29Ytge86xTueLaj0H79Xo1Pnc-S5F0bexTJDwfU2clK7FxPI5CuyCoQ';
        if(token) {
            if(token === '0') {
                return Promise.reject({
                    status: 4002,
                    msg: '账号未绑定过手机号码'
                })
            }else {
                return Promise.resolve(token);
            }
        }else {
            return updateToken();
        }
    });


}

/* request 封装*/
var wxrequest = wxPromisify(wx.request);
function wxRequest(options, tokenNotRequired){
    return wxrequest(options).then(res => {
      var data = res.data;
      if(data.status === 404404) {
          if(tokenNotRequired){
                delete options.headers;
                return wxRequest(options);
          }else{
                return updateToken().then(token => {
                    return wxRequest(object.assignIn(options, {
                        headers: { 'X-Auth-Token': token }
                    }));
                });
          }
      }else {
          return Promise.resolve(data);
      }
    }).catch(err => {
      return Promise.reject(err);
    });
}


/* store封装 */
function setStoreage(key, value, isSync=true){
  if(isSync){
      try {
          wx.setStorageSync(key, value);
      } catch (e) {    
          wx.showToast({
            title: e,
            duration: 2000
          }); 
      }
  }else{
      wx.setStorage({
        key: key,
        data: value
      });
  }
}
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
  removeStorage: removeStorage,
  setStoreage: setStoreage,
  wxPromisify: wxPromisify,
  wxRequest: wxRequest
}
