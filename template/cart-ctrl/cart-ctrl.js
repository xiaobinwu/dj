/**
 * 产品加减部件
 *
 * @author xiaobin_wu
 */
var cart = require('../../utils/cart.js');
var util = require('../../utils/util.js');
class CartCtrl{
    constructor(pageContext){
        this.page = pageContext; //获取页面上下文
        this.page.data.currentProCounts = [];
        this.page._cartSet = this._cartSet.bind(this);
    }
    _cartSet(e){
        var findex = e.currentTarget.dataset.findex,
            index = e.currentTarget.dataset.index;
        cart.cartCountChange(e.currentTarget.dataset.pro,e.currentTarget.dataset.type).then(result => {
            if(typeof findex != 'undefined' &&　typeof index != 'undefined'){
                var currentProCount = this.page.data.currentProCounts[findex][index];
                if(result === 'add'){
                    this.page.setData(util.dynamicSetData('currentProCounts', findex, { goods_number: ++currentProCount.goods_number, goods_id: currentProCount.goods_id }, index, 'array'));
                }else if(result === 'reduce'){
                    this.page.setData(util.dynamicSetData('currentProCounts', findex, { goods_number: --currentProCount.goods_number, goods_id: currentProCount.goods_id }, index, 'array'));
                }
            }else{
                this.cartChange(e); //不带index、findex，必须保证page里面有当前分类索引
            }
            //与购物车cart.js通讯
            this.page.cart.resetCartData();
        });
    }
    //获取当前分类所有产品的currentProCount,template没有属于自己js，所有操作都是需要绑定到page实例上（注意滚动时数据添加）
    getCurrentProCounts(pros,index){
        //获取app实例
        if(typeof this.page.data.currentProCounts[index]=='undefined'){          
            this.page.setData(util.dynamicSetData('currentProCounts', index, []));
        }
        var arr = [],
            appInstance = getApp(),
            currentProCounts = this.page.data.currentProCounts[index],
            cartList = appInstance.globalData.cartData.list;

            for(let p = 0; p < pros.length; p++){
                var goods_number = 0;
                if(cartList.length >= 1){
                    for(let c = 0; c < cartList.length; c++){
                        if(cartList[c].goods_id == pros[p].goods_id){
                            goods_number = parseInt(cartList[c].goods_number);
                        }      
                    }
                }
                arr.push({
                    goods_number: goods_number,
                    goods_id: pros[p].goods_id
                });
            }
        this.page.setData(util.dynamicSetData('currentProCounts', index, currentProCounts.concat(arr)));
    }
    //购物车加减产品处理逻辑（只针对当前分类）
    cartChange(e){
        if(this.page.data.isNotComputedCurrentProCounts){return;} //商品详情不需要计算currentProCounts
        var currentIndex = this.page.data.currentIndex,
            goods_id = e.currentTarget.dataset.pro.goods_id,
            type = e.currentTarget.dataset.type;
        if(typeof currentIndex === 'undefined'){
           return wx.showToast({
                title: '获取不到当前分类',
                duration: 2000
            })
        }
        var currentProCounts = this.page.data.currentProCounts[currentIndex];
        for(let i = 0; i < currentProCounts.length; i++){
            if(goods_id == currentProCounts[i].goods_id){
                    if(type === 'add'){
                        this.page.setData(util.dynamicSetData('currentProCounts', currentIndex, { goods_number: ++currentProCounts[i].goods_number, goods_id: currentProCounts[i].goods_id }, i, 'array'));
                    }else if(type === 'reduce'){
                        this.page.setData(util.dynamicSetData('currentProCounts', currentIndex, { goods_number: --currentProCounts[i].goods_number, goods_id: currentProCounts[i].goods_id }, i, 'array'));
                    }
                    break;
            }
        }
    }
    //分类swiper切换时，更新对应分类的购物车数据
    switchCartCheck(pros,index){
        var arr = [],
            appInstance = getApp(),
            currentProCounts = this.page.data.currentProCounts[index],
            cartList = appInstance.globalData.cartData.list;

            for(let p = 0; p < pros.length; p++){
                var goods_number = 0;
                if(cartList.length >= 1){
                    for(let c = 0; c < cartList.length; c++){
                        if(cartList[c].goods_id == pros[p].goods_id){
                            goods_number = parseInt(cartList[c].goods_number);
                        }      
                    }
                }
                arr.push({
                    goods_number: goods_number,
                    goods_id: pros[p].goods_id
                });
            }
        this.page.setData(util.dynamicSetData('currentProCounts', index, arr));
    }
}
module.exports = CartCtrl