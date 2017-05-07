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
        var findex = e.currentTarget.dataset.findex,
            index = e.currentTarget.dataset.index;
        cart.cartCountChange(e.currentTarget.dataset.pro,e.currentTarget.dataset.type).then(result => {
            if(typeof findex != 'undefined'){
                var currentProCount = this.page.data.currentProCounts[findex][index];
                if(result === 'add'){
                    this.page.setData(this.page.dynamicSetData('currentProCounts', findex, ++currentProCount, index, 'array'));
                }else if(result === 'reduce'){
                    this.page.setData(this.page.dynamicSetData('currentProCounts', findex, --currentProCount, index, 'array'));
                }
            }else{

            }
        });
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
            }
        this.page.setData(this.page.dynamicSetData('currentProCounts', index, currentProCounts.concat(arr)));
    }
}
module.exports = CartCtrl