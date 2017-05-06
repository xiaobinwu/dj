/**
 * 产品加减部件
 *
 * @author xiaobin_wu
 */
var cart = require('../../utils/cart.js');
class CartCtrl{
    constructor(pageContext){
        this.page = pageContext; //获取页面上下文
        this.page.data.currentProCounts = [];
        this.page._cartSet = this._cartSet.bind(this);
    }
    _cartSet(e){
        cart.cartCountChange(e.currentTarget.dataset.pro,e.currentTarget.dataset.type, e.currentTarget.dataset.index);
    }
    //获取当前分类所有产品的currentProCount,template没有属于自己js，所有操作都是需要绑定到page实例上
    getCurrentProCounts(pros,index){
        //获取app实例
        if(typeof this.page.data.currentProCounts[index]=='undefined'){          
            this.page.setData(this.page.dynamicSetData('currentProCounts', index, []));
        }
        var arr = new Array(pros.length).fill(0),
            appInstance = getApp(),
            currentProCounts = this.page.data.currentProCounts[index],
            cartList = appInstance.globalData.cartData.list;
            if(cartList){
                for(let i = 0; i < pros.length; i++){
                    for(let j = 0; j < cartList.length; j++){
                        if(cartList[j].goods_id == pros[i].goods_id){
                            arr[i] = parseInt(cartList[j].goods_number);
                            continue;
                        }
                    }
                }
                // pros.forEach((p, index) =>{
                //     cartList.forEach(d =>{
                //         if(d.goods_id == p.goods_id){
                //             arr[index] = parseInt(d.goods_number);
                //         }
                //     });
                // });
            }
        this.page.setData(this.page.dynamicSetData('currentProCounts', index, currentProCounts.concat(arr)));
    }
}
module.exports = CartCtrl