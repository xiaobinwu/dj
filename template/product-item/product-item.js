/**
 * 产品Item模板
 *
 * @author xiaobin_wu
 */
class ProductItem{
    constructor(pageContext){
        this.page = pageContext; //获取页面上下文
        this.page._goDetail = this._goDetail.bind(this);
    }
    _goDetail(e){
        //详情页
        wx.navigateTo({
            url: '../detail/detail?id=' + e.currentTarget.dataset.goodsId
        });        
    }
}
module.exports = ProductItem