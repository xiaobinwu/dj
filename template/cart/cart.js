/**
 * 购物车组件
 *
 * @author xiaobin_wu
 */
var util = require('../../utils/util.js');
var calculate = require('../../utils/calculate.js');
var cart = require('../../utils/cart.js');
// 引入promise
var Promise = require('../../lib/es6-promise.min.js'); 
class Cart {
    constructor(pageContext){
        this.page = pageContext; //获取页面上下文
        this.page.data.showCartPanel = false; //是否中显示购物车列表面板
        this.page.data.cartBaseInfo = {};  // 购物车综合信息
        this.page._goCheckout = this._goCheckout.bind(this);
        this.page._switchCartPanel = this._switchCartPanel.bind(this);
        this.page._emptyCart = this._emptyCart.bind(this);
        this.appInstance = getApp();
    }
    _goCheckout(){
        wx.showToast({
            title: '未能支付，期待吧！',
            duration: 2000
        })
    }
    _switchCartPanel(){
        var _self = this;
        // 无商品时不开启
        if(this.getCartList().length<1){
            return;
        }
        // 开启购物车面板校验购物车
        if(!this.page.data.showCartPanel){
            this.initCartData();
        } 
        this.page.setData({
            showCartPanel: !_self.page.data.showCartPanel
        });
    }
    _emptyCart(){
        var _self = this;
        wx.showModal({
            title: '提示',
            content: '确认清空购物车?',
            confirmColor: '#e61773',
            cancelColor: '#666666',
            success: function(res) {
                if (res.confirm) {
                    _self.appInstance.globalData.cartData.list = [];
                    cart.saveCartDataToLocal([], _self.appInstance.globalData.cartData.storeId);
                    _self.resetCartData();
                    if(_self.page.data.isNotComputedCurrentProCounts){return;} //商品详情不需要计算currentProCounts
                    //重置currentProCounts
                    var arr = [],
                        currentProCounts = _self.page.data.currentProCounts;
                    for(let i = 0; i < currentProCounts.length; i++){
                        if(currentProCounts[i]){
                            var arrTemp = [];
                            for(let j = 0; j < currentProCounts[i].length; j++){
                                var arrItem = {
                                        goods_number: 0,
                                        goods_id: currentProCounts[i][j].goods_id
                                    };
                                arrTemp.push(arrItem);
                            }
                            arr.push(arrTemp);
                        }
                    }
                    _self.page.setData({
                        currentProCounts: arr
                    });
                }
            }
        });
    }
    initCartData(){
         this.validCartData().then(() => {
            this.resetCartData();
         });
    }
    resetCartData(){
        var cartBaseInfo = {},
            cartList = this.getCartList();
            // console.log(this.appInstance.globalData.cartData);
        if(cartList.length < 1){
            this.page.setData({
                showCartPanel: false
            });
        }
        cartBaseInfo = {
            cartList: this.getCartList(),
            totalCount: this.getTotalCount(),
            totalPrice: this.getTotalPrice(),
            StoreName: this.getStoreName(),
            btnClass: this.getBtnClass(),
            btnDesc: this.getBtnDesc()
        }
        this.page.setData({
            cartBaseInfo: cartBaseInfo
        });
    }
    // 校验购物车数据
    validCartData(){
        var storeId = this.getStoreId() || JSON.parse(util.getStorage('current_store_info')).store_id; //编译时，this.getStoreId()获取不到值，this.appInstance.globalData.cartData却能打印
        return cart.syncCartData(storeId).then((data)=>{
            console.log(data)
            var cartList = data.goodsList || [];
            this.appInstance.globalData.cartData.list = cartList;
            return Promise.resolve();
        }).catch(e=>{
            console.warn(e);
            return Promise.reject();
        });
    }
    getCartData(){
        return this.appInstance.globalData.cartData;
    }
    getCartList(){
        return this.appInstance.globalData.cartData.list;
    }
    getStoreId(){
        // console.log(this.appInstance.globalData.cartData);
        // console.log(this.appInstance.globalData.cartData.storeId);
        // console.log(this.appInstance.globalData.cartData);
        return this.appInstance.globalData.cartData.storeId;
    }
    getStoreName(){
        return this.appInstance.globalData.cartData.storeName;
    }
    // 起送价
    getMinPrice(){
        return parseFloat(this.appInstance.globalData.cartData.floorPrice);
    }
    // 总价
    getTotalPrice(){
        var total = 0;
        this.getCartList().forEach((pro) => {
            var 
                // 单价
                singlePrice = pro.sale_price ? pro.sale_price : pro.avg_price,
                // 数量
                count = parseInt(pro.goods_number),
            
                // 单商品正常购买价
                normalMoney = calculate.calcMul(singlePrice,count);


            total = calculate.calcAdd(total,normalMoney);
        });

        this.appInstance.globalData.cartData.totalPrice = total;
        return total == 0 ? '0.00' : total;
    }
    // 总数量
    getTotalCount(){
        var count = 0;
        this.getCartList().forEach((pro) => {
            count += parseInt(pro.goods_number);
        });
        return count;
    }
    // 结算按钮内容
    getBtnDesc(){
        var totalPrice = this.getTotalPrice(),
            minPrice = this.getMinPrice();
        if (totalPrice === 0) {
            return  `${minPrice}元起送`;
        } else if (totalPrice < minPrice) {
            let diff = calculate.calcReduce(minPrice,totalPrice);
            return `差${diff}元起送`;
        } else {
            return '去结算';
        }
    }
    // 结算按钮样式
    getBtnClass(){
        var totalPrice = this.getTotalPrice(),
            minPrice = this.getMinPrice(),
            cartList = this.getCartList();
        for(let i = 0;i < cartList.length;i++){
            if(cartList[i].valid==0){
                return ['gray','购物车内存在失效商品'];
            }
        }
        if (totalPrice < minPrice) {
            return ['gray','还差'+(totalPrice - minPrice)+'元起送'];
        } else {
            return ['red'];
        }
    }
}
module.exports = Cart