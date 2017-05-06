/* 接口api */
var wdomain = "https://www.wzhouhui.com/dj",
    mdomain = "https://m.wzhouhui.com";

module.exports = {
    // 地址模块
    getLocation: wdomain + '/Location/getLocation',
    // 有门店的省市区列表
    regionList: wdomain + '/store/regionList',
    //门店模块
    storeShow: wdomain + '/store/show',
    storeMore: wdomain + '/store/more',
    storeSearch: wdomain + '/store/searchStore',

    // 商品
    goodsDetail: wdomain + '/goods/goodsDetail',
    goodsSearchGoods: wdomain + '/goods/searchGoods',
    goodsGoodslist: wdomain + '/goods/goodslist',

    // 购物车
    cartCheck: wdomain + '/Cart/cartCheck',

}