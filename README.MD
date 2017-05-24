# 微信小程序实战

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
### 2. Javascript作用域问题
由于小程序默认给的微信地图api有些需求达不到要求，于是使用第三方库（qqmap-wx-jssdk.min.js，这是绝配），这样定位功能也比较好做，以及后续要做的地址管理模块也比较好下手，但是有个问题，对微信地图jdk接口进行promise化后，使用过程会报错，导致定位失败，所以需要改变其执行作用，于是对wxPromisify()方法做了些改造，重新绑定作用域至qqmapsdk，调用如下： 
```javascript
//address.js
// 引入SDK核心类
var QQMapWX = require('../lib/qqmap-wx-jssdk.min.js');
// 实例化API核心类(需要配置安全域名https://apis.map.qq.com)
var qqmapsdk = new QQMapWX({
    key: 'xxxxx' //需要到腾地图上申请key
});

...
...

// 请求用户授权定位
//逆地址解析
var ReverseGeocoder = util.wxPromisify(qqmapsdk.reverseGeocoder, qqmapsdk); //需改变作用域

```

### 3. 如何衍生出组件模板
模板页（template）没有天生配对js，但是也可以实现，实现面向对象的思想，对模板所需要的js进行一层类的封装，保证构造函数需要接受父页面的上下文对象，然后可以把声明好的类方法绑定到父页面上面去，对于模板页js方法，以_FUN()方式命名。下面是为图片懒加载优化而做的swiper模板组件，可以参考一下。 
```javascript
/**
 * 图片预加载组件
 *
 * @author xiaobin_wu
 * template/silder/silder.js
 */
class Slider {
    constructor(pageContext, options = { picList: [], showArr:[] }){
        this.page = pageContext; //获取页面上下文
        this.page.data.slider = {
            picList: options.picList,
            showArr: options.showArr
        }; //初始化data
        this.page._sliderChange = this._sliderChange.bind(this);
    }
    //监听滑动事件，实现图片懒加载
    _sliderChange(e){
        if(this.page.data.slider.showArr){
            let showArr = this.page.data.slider.showArr;
            for(let i = 0; i < showArr.length; i++){
                if(i === e.detail.current){
                    showArr[i] = true;
                }
            }
            this.page.setData({
                'slider.showArr': showArr
            });
        }
    }
    initData(imgs){
        const arr = new Array(imgs.length).fill(false);
        this.page.setData({
            'slider.picList': imgs,
            'slider.showArr': arr.fill(true, 0 , 1)
        });
    }
}
module.exports = Slider

```
以类形式module.exports出去，Page页面，以`var Slider = require('../../template/slider/slider.js');`形式引入，然后`new`操作，模板wxml也参考`template/silder/silder.wxml`，也可以对应写wxss，这样做模板页复用性高，类似组件的模式。

### 4. scroll-view使用scroll-x失效问题
刚开始使用scroll-view，scroll-x一直失效，不能水平scroll，折腾了好多时间，结果这样就成了，大概如下结构（home.wxml）：
```html

<scroll-view  scroll-x="{{true}}" scroll-left="{{scrollLeft}}"  class="scroll-bar" style="width:100%;" >
    <view style="width: {{idxData.navbar.length * 168}}rpx">
        <view wx:for="{{idxData.navbar}}" wx:for-item="cate" class="cate-item {{index == currentIndex ? 'active' : ''}}" data-id="{{cate.nav_id}}" data-index="{{index}}" bindtap="cateClick">{{cate.nav_name}}</view>
    </view>
</scroll-view>

```
忽略其他乱起八糟的代码，主要是这个`<view style="width: {{idxData.navbar.length * 168}}rpx">`,需要保证scroll-view下面的view的width必须要大于100%，充满整个scroll-view

### 4. swiper高度无法自动撑开，暂时不支持
![cmd-markdown-logo](git-image/swiper.png) 于是对于红线部分的产品分类swiper，就只能手动计算swiper高度，来实现swiper的效果，但是由于对应每个swiper-item还会有个下拉加载，所以产品数目会一直变化，所以计算起来相当于耗性能，希望官方能尽快让swiper高度允许自动撑开



## 最后上一波gif图片

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