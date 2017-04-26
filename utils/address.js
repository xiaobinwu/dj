/* 地址逻辑处理脚本 */


var util = require('./util.js');
var ports = require('./ports.js');
var region = require('./region.js');
// 引入promise
var Promise = require('../lib/es6-promise.min.js'); 
// 引入SDK核心类
var QQMapWX = require('../lib/qqmap-wx-jssdk.min.js');
// 实例化API核心类(需要配置安全域名https://apis.map.qq.com)
var qqmapsdk = new QQMapWX({
    key: 'LHVBZ-DQVWW-C2YRC-REKYI-HRUV7-JPFYV' //个人key，需要替换成公司的key
});
/*获取gps坐标 */
function getCoords(){
    var getLocationPromisified = util.wxPromisify(wx.getLocation);
    getLocationPromisified({
        type: 'wgs84'
    }).then(function(res){
        return Promise.resolve({
            lat: res.latitude,
            lng: res.longitude
        });
    }).catch(function(err){
        wx.showToast({
            title: 'get location failed',
            duration: 2000
        }); 
    });
}
/**
 * 将GPS信息存储以后面备用
 * @param  {Object} info [定位信息]
 */
function saveGPSInfo(info){
    // 将GPS信息存储以后面备用
    util.setStoreage('gps_info',JSON.stringify(info));
}

/**
 * 尝试通过QQMap获取定位信息
 * @return {Object} {lng,lat,location_addr,region_id,region_name}
 */
function getGPSInfo(){
    return new Promise((resolve,reject)=>{
        var data={
            lng:'',
            lat:'',
            location_addr:'',
            region_id:'',
            region_name:''
        };
        getCoords().then((point)=>{
            // 请求用户授权定位
            //逆地址解析
            var reverseGeocoder = util.wxPromisify(qqmapsdk.reverseGeocoder);
            return reverseGeocoder({
                location:{
                    latitude: point.lat,
                    longitude: point.lng 
                }
            });
        }).then((res)=>{// 拿到腾讯地图解析过后的数据
            // 经度
            data.lng = res.result.ad_info.location.lng;
            // 纬度
            data.lat=res.result.ad_info.location.lat;
            //详细地址
            data.location_addr = res.result.address;

            return region.getRegionId(res.result.address_component.city);

        }).then((region)=>{// 通过城市名拿到城市区域id后

            data.region_id = region.value;
            data.region_name = region.name;

            // 全量式返回定位结果
            saveGPSInfo(data);
            resolve({data});

        }).catch((err)=>{

            console.warn('address:getGPSInfo=>',err);
            // 增量式返回定位结果
            saveGPSInfo(data);
            // 结果无论怎样都需要返回后端进行统一处理,所以不用reject
            resolve({data,err});

        });
    });
}
/**
 * 由服务器端处理地址逻辑
 * @param  {Object} addressData 可选择性传入定位信息,如果不传则会要求用户授权定位
 * @return {Promise}            then返回地址逻辑结果,catch抛出相关错误
 */
function getLocation(options){
    var token = util.getStorage("token"),
        ajaxCfg = {
            method: 'POST',
            url: ports.getLocation
        },
        needToken = 'token' in options ? options.token : true;
        // 如果本地缓存token，则使用
        if(token && needToken){ 
            ajaxCfg.headers={'X-Auth-Token':token};
        }        
        return new Promise((resolve,reject)=>{
            // 如果有已存在的定位信息(一般来自本地存储)
            if(typeof options.gpsInfo != 'undefined'){
                ajaxCfg.data = options.gpsInfo;
                util.wxRequest(ajaxCfg, true).then(result=>{
                    resolve(result);
                }).catch(err=>{
                    reject(err);
                });
            }else{
                //通过GPS授权获取定位信息
                getGPSInfo().then(result=>{
                    if(result.err){
                        options.gpsError && options.gpsError(result.err);
                    }
                    ajaxCfg.data= result.data;
                    return util.wxRequest(ajaxCfg, true);
                }).then(result=>{
                    resolve(result);
                }).catch(err=>{
                    reject(err);
                });
            }
        });
}

module.exports = {
  getGPSInfo: getGPSInfo,
  getLocation: getLocation
}