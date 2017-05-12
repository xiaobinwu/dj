var util = require('./util.js');
var ports = require('./ports.js');
// 引入promise
var Promise = require('../lib/es6-promise.min.js'); 
// 获取本地购物车缓存数据(门店id)
function getLocalCartData(store_id){
    var localData = util.getStorage("store" + store_id);
    if(localData){
        return JSON.parse(localData);
    }
    return [];
}

// 将购物车数据存到本地
function saveCartDataToLocal(arr,store_id){
    var newArr=[];
    arr.forEach((item)=>{
        var obj = {};
        obj.goods_number = item.goods_number;
        obj.goods_id = item.goods_id;
        newArr.push(obj);
    });
    util.setStorage("store" + store_id, JSON.stringify(newArr));
}

// 将本地购物车组装成需要同步的数据(门店id)
function handleCartData(store_id){
    var localData = getLocalCartData(store_id),
        productArr=[];
    localData.forEach((product)=>{
        productArr.push([product.goods_id,product.goods_number].join("|"));
    });
    return productArr.length ? productArr.join(",") : '';
}

// (校验)同步购物车信息
function syncCartData(store_id){
    var productStr = handleCartData(store_id),
        token = util.getStorage("token"),
        ajaxCfg = {};

    if(!productStr){
        return Promise.resolve([]);
    }

    if(!store_id){
        return Promise.reject("门店id无效");
    }

    ajaxCfg={
        method: 'POST',
        url: ports.cartCheck,
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
            store_id: store_id,
            products: productStr
        }
    };

    if(token){
        ajaxCfg.header['X-Auth-Token'] = token;
    }

    return new Promise((resolve,reject)=>{
        util.wxRequest(ajaxCfg).then((result)=> {
            resolve(result.data);
        }).catch((e)=>{
            reject(e);
        });
    });
}

// 购物车（加减操作）数量变更
function cartCountChange(pro,flag){
    //获取app实例
    var appInstance = getApp(),
        toastMsg = '',
        cartList = appInstance.globalData.cartData.list,
        storeId = appInstance.globalData.cartData.storeId,
        // 判断当前操作在商品是否在购物车中
        isInCart = util.objInList(pro,'goods_id','goods_id',cartList);

    // 已售罄?
    if(!pro.valid && flag=='add'){
        wx.showToast({
            title: '该商品已售罄',
            duration: 1000
        })
        return Promise.reject();
    }

    // 当前操作在商品已在购物车中
    if(isInCart.flag){
        // 当前操作商品在购物车中的序列
        var isInCartIndex = isInCart.index;

        if(flag == "add"){

            // 库存不足时
            if(pro.stock_available <= cartList[isInCartIndex].goods_number){
                wx.showToast({
                    title: `商品数量仅剩${pro.stock_available}件了`,
                    duration: 1000
                });
                return Promise.reject();
            }else{
                wx.showToast({
                    title: `加入购物车成功`,
                    icon: 'success',
                    duration: 1000
                });
                cartList[isInCartIndex].goods_number++;
            }
            
        }else{
            cartList[isInCartIndex].goods_number--;
            // 数量减至0时从购物车中移除该商品
            if(cartList[isInCartIndex].goods_number < 1){
                cartList.splice(isInCartIndex,1);
            }
        }          
    }

    // 当前操作的商品尚未在购物车中
    else{
        if(flag=="add"){
            wx.showToast({
                title: `加入购物车成功`,
                icon: 'success',
                duration: 1000
            });
            pro.goods_number = 1;
            cartList.push(pro);
        }
    }

    //全局共享
    appInstance.globalData.cartData.list = cartList;
    // 将购物车数据存至本地
    saveCartDataToLocal(cartList,storeId);
    return Promise.resolve(flag);
}


module.exports = {
  syncCartData: syncCartData,
  saveCartDataToLocal: saveCartDataToLocal,
  cartCountChange: cartCountChange
}
