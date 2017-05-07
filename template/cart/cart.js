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
        this.appInstance = getApp();
    }
    initCartData(){
         this.validCartData().then(() => {
            if(this.isShowCartPanel()){
                this.resetCartData();
            }
         })
    }
    resetCartData(){
        var cartBaseInfo = {
            cartList: this.getCartList(),
            totalCount: this.getTotalCount(),
            totalPrice: this.getTotalPrice(),
            btnClass: this.getBtnClass(),
            btnDesc: this.getBtnDesc()
        }
        this.page.setData({
            cartBaseInfo: cartBaseInfo
        });
    }
    // 校验购物车数据
    validCartData(){
        var storeId = this.getStoreId();
        cart.syncCartData(storeId).then((data)=>{
            var cartList = data.goodsList || [];
            this.appInstance.globalData.cartData.list = cartList;
            Promise.resolve();
        }).catch(e=>{
            console.warn(e);
            Promise.reject();
        });
    }
    isShowCartPanel(){
        if(this.getCartList().length<1){
            this.page.data.setData({
                showCartPanel: false
            });
            return false;
        } 
        return true;
    }
    getCartData(){
        return this.appInstance.globalData.cartData;
    }
    getCartList(){
        return this.appInstance.globalData.cartData.list;
    }
    getStoreId(){
        return this.appInstance.globalData.cartData.storeId;
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