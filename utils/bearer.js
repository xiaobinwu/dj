var util = require('./util.js');
var ports = require('./ports.js');
/* 门店地址处理脚本 */
function address(){
    var _self = this;
    //门店派发页面
    this.storePage = {
        1:'#/store/index',
        2:'#/store/list',
        3:'#/store/more'
    };
    //当前地址信息
    this.currentAddress = {
        address_id:"",
        lng: "",
        lat: "",
        location_addr: "",
        region_id: "",
        region_name: ""       
    };
    // 当前用户地址信息(跟账号关联)
    this.userLocationData = [];
}

address.prototype = {
    init: function(){
        // 来自用户自主选择的地址
        var selAddress = util.getStorage('currentAddress');
        // 如果是用户自主选择地址,优先使用(一般情况下是进到首页才能选择地址，才能来到这里)
        if(selAddress){
            selAddress=JSON.parse(selAddress);
            this.currentAddress={
                address_id:selAddress.address_id,
                lng: selAddress.address_lng,
                lat: selAddress.address_lat,
                location_addr: selAddress.addressline||selAddress.addressDetail,
                region_id: selAddress.city,
                region_name: selAddress.city_name
            };            
            // 清除此前用户在更多门店页面选择的门店
            util.removeStorage('select_store_id');
            // 通过组装的地址信息获取分发信息
            this.getInfoByAddress(this.currentAddress);
        }else{
            // 通过定位获取地址(一般情况下首次进入，或从其他页面想回到首页)
            // 通过定位获取相关信息
            this.getInfoByAddress();
        }
    },
    getInfoByAddress: function(){
        var _self = this, token = util.getStorage("token"),
        ajaxCfg={
            method: 'post',
            url: ports.getLocation,
            data: JSON.stringify(_self.currentAddress)
        };
        if(token){
            ajaxCfg.headers={'X-Auth-Token':token};
        }
        
        return commonAjax(ajaxCfg);
    }
}