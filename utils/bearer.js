var util = require('./util.js');
var ports = require('./ports.js');
var location = require('./address.js');
/* 首页承载页，数据源处理逻辑 */
function address(){
    var _self = this;
    //门店派发页面
    this.storePage = {
        1:'../home/home',
        2:'../list/list',
        3:'../more/more'
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
    // 用地址信息获取可配送状态及分发信息
    getInfoByAddress: function(addressData){
        var _self = this;
        // 处理地址逻辑
        location.getLocation({
            gpsInfo: addressData,
            token: addressData ? false : true
        }).then((result)=>{
            // console.log(result)
            _self.userLocationData = result.data;
            // 将最终得到地址地址存入本地
            util.setStorage("final_address", JSON.stringify(_self.userLocationData.final_address));
            var 
                // 分发结果
                switchResult = _self.switchAddress(),
                // 组合分发结果数据
                pageSwitchInfo={
                    page: switchResult.page,
                    // 结果页弹层类型
                    popType: switchResult.popType || 0,
                    title: switchResult.txt
                };

            // 将分发信息存入本地
            util.setStorage("page_switch_info", JSON.stringify(pageSwitchInfo));

            //微信没有window、document对象，不能带有路径，也没有会话管理，待修改
            // 进入结果页前 打上进入线下店标识
            // asyncStoreInfo(function(){
            //     // 跳转到分发页面
            //     location.href=_self.storePage[pageSwitchInfo.page];
            // });

            //关闭承载页，跳转到应用内的某个页面。    
            if(pageSwitchInfo.page === 1){
                wx.switchTab({
                    url: _self.storePage[pageSwitchInfo.page]
                });
            }else{
                wx.redirectTo({
                    url: _self.storePage[pageSwitchInfo.page]
                });
            }


        }).catch((e)=>{
            console.log(e)
            wx.showToast({
                title: "定位失败",
                duration: 2000
            }); 
        });
    },
    //处理定位地址逻辑
    switchAddress: function(){
        var
            oData = this.userLocationData,
            has_location = oData.has_location,
            has_location_store = oData.has_location_store,
            has_address = oData.has_address,
            has_address_store = oData.has_address_store,
            is_near = oData.is_near,
            has_order = oData.has_order,
            has_city_store = oData.has_city_store,
            final_address = oData.final_address,
            // 分情况配置
            cfg={};

        //已开定位
        if(has_location){ 

            // 当前定位有配送门店
            if(has_location_store){

                // 有收货地址且有可配送门店
                if(has_address_store){

                    // 定位地址与收货地址较近
                    if(is_near){
                        cfg={
                            page: 1,
                            txt: final_address.location_addr,
                            popType: 0
                        }
                    }

                    // 定位地址与收货地址有段距离
                    else{
                        cfg={
                            page: 1,
                            txt: final_address.location_addr,
                            popType: 0
                        }
                    }
                }

                // 虽有收货地址，但其中均无可配送门店
                else{
                    cfg={
                        page: 1,
                        txt: final_address.location_addr,
                        popType: 0
                    }
                }
                
            }

            // 当前定位无配送门店
            else{
                // 收货地址有配送门店
                if(has_address_store){

                    // 有用收货地址下过单
                    if(has_order){
                        cfg={
                            page: 1,
                            txt: final_address.location_addr,
                            popType: 1
                        }
                    }else{
                        cfg={
                            page: 2,
                            txt: final_address.location_addr,
                            popType: 1
                        }
                    }
                }

                // 收货地址无配送门店
                else{
                    // 当前定位城市有其他门店
                    if(has_city_store){
                        cfg={
                            page: 2,
                            txt: final_address.location_addr,
                            popType: 2
                        }
                    }
                    // 当前定位城市无门店
                    else{
                        cfg={
                            page: 3,
                            txt: final_address.location_addr,
                            popType: 3
                        }
                    }
                }
            }
        }

        //无定位 
        else{
            // 有收货地址且有配送门店
            if(has_address_store){

                // 有订单，说明可以收货
                if(has_order){
                    cfg={
                        page: 1,
                        txt: final_address.location_addr,
                        popType: 0
                    }
                }
                // 未下单，可能多个地址都支持，让用户去切换离自己最近的收货地址
                else{
                    cfg={
                        page: 3,
                        txt: 0,
                        popType: 2
                    }
                }   
            }

            // 收货地址都没，就更没法知道是否能配送了
            else{
                cfg={
                    page: 3,
                    txt: 0,
                    popType: 1
                }
            }
        }

        return cfg;        
    }
}
module.exports = {
  init: function(){
      new address().init();
  }
}