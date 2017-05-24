/**
 * 优惠券组件
 *
 * @author xiaobin_wu
 */
var util = require('../../utils/util.js');
class CouponItem {
    constructor(pageContext){
        this.page = pageContext; //获取页面上下文
        this.page._showCouponDetail = this._showCouponDetail.bind(this);
        this.page._changeExpend = this._changeExpend.bind(this);
    }
    init(){
        var couponData = this.page.data.couponData;
        for(let i = 0; i < couponData.length; i++){
            if(couponData[i].code_desc){
                couponData[i].code_desc = couponData[i].code_desc.split(/\n/g)
            }else{
                couponData[i].code_desc = ['部分促销商品不参与优惠券优惠，具体以门店实际优惠活动为准'];
            }
        }
        this.page.setData({
            couponData: couponData
        });
    }
    _showCouponDetail(e){
        if(e.currentTarget.dataset.todetail){
            var id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '../coupon-detail/coupon-detail?codeId=' + id
            });        
        }
    }
    _changeExpend(e){
        var index = e.currentTarget.dataset.index;
        var value = !this.page.data.couponData[index].isexpend;
        this.page.setData(util.dynamicSetData('couponData', index, value, 'isexpend'));
    }
}
module.exports = CouponItem