# 微信小程序实战

------

## 先上一波gif图片

#### 首页（定位成功情况且有门店）
![cmd-markdown-logo](git-image/1.gif)
#### 门店列表（定位成功情况却没有门店）
![cmd-markdown-logo](git-image/7.gif)
#### 更多（定位没有成功情况也没有门店）
![cmd-markdown-logo](git-image/8.gif)
#### 产品详情页
![cmd-markdown-logo](git-image/2.gif)
#### 门店详情
![cmd-markdown-logo](git-image/3.gif)
#### 更多门店
![cmd-markdown-logo](git-image/4.gif)
#### 订单及订单详情
![cmd-markdown-logo](git-image/5.gif)
#### 个人中心
![cmd-markdown-logo](git-image/6.gif)

## 版本：0.15.152900（暂未升级原因：升级后需要图片无法本地引用，必须使用image或是远程路径引用）

## 目录结构
![mulu](git-image/mulu.png)
> * css => 放置公用wxss,目前只有一个font.wcss
> * image => 静态资源目录
> * lib => 第三方库（如：qqmap-wx-jssdk.min.js）
> * pages => 小程序页面（包括四个文件，.wxml/.wxss/.js/.json）
> * template => 抽离出来的template，具有复用性
> * utils => 工具类
> * app.js/app.json/app.wxss => 配置


## 踩过的坑

### 1. promise封装
官方request代码： 
```javascript
wx.request({
  url: 'test.php', //仅为示例，并非真实的接口地址
  data: {
     x: '' ,
     y: ''
  },
  header: {
      'content-type': 'application/json'
  },
  success: function(res) {
    console.log(res.data)
  }
})
```
但是有很多场景需要promise化的，所以使用第三方promise库（es6-promise.min.js），对request进行了一层包装： 
```javascript
/* utils/util.js */
/* api接口promise 柯里化*/
var Promise = require('../lib/es6-promise.min.js'); 
function wxPromisify(fn, scope) {  
  return function (obj = {}) {    
    return new Promise((resolve, reject) => {      
      obj.success = function (res) {        
        resolve(res);      
      }      
      obj.fail = function (res) {        
        reject(res);      
      }
      if(scope){
        //改变this指向
        var newFn = fn.bind(scope);
        newFn(obj);
      }else{
        fn(obj);
      }      
    })  
  }
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


```
