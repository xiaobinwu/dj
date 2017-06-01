/**
 * 顶部导航组件
 *
 * @author xiaobin_wu
 */
class topNavSel {
  constructor(pageContext) {
    this.page = pageContext; //获取页面上下文
    this.page._toSwitchAddress = this._toSwitchAddress.bind(this);
  }
  //跳转页面
  _toSwitchAddress(e) {
    wx.navigateTo({
      url: '../address-switch/address-switch'
    });
  }
}
module.exports = topNavSel;