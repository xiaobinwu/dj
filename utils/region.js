/* 省份城市列表 */
var util = require('./util.js');
var ports = require('./ports.js');
// 引入promise
var Promise = require('../lib/es6-promise.min.js'); 

function ajaxGetRegion() {
    return util.wxRequest({
        url: ports.regionList
    }).then(res => {
        return Promise.resolve(res.data);
    }).catch(err => {
        return Promise.reject(err);
    })
}


function rankData(array) {
    var list = [],
        task = {},
        taskList = [];
    // 按省市级排序循环数据
    function group(dataList, key, parent) {
        var taskList = [];
        if(!task[key]) {
            task[key] = new Array();
        }
        task[key].push(getData(dataList, parent));
        for(let i = 0; i < dataList.length; i++) {
            if(dataList[i].child) {
                group(dataList[i].child, key+1, dataList[i].parent_id);
            }
        }
    }
    group(array, 0);
    // 循环子数据，提交到list
    function getData(array, id, cb) {
        return function() {
            for(let i = 0; i < array.length; i++) {
                var data = {};
                data.name = array[i].region_name;
                data.value = String(array[i].region_id);
                if(array[i].parent_id && array[i].parent_id != '1') {
                    data.parent = array[i].parent_id;
                }
                list.push(data);
            }
        }
    }
    // 合并数据层
    for(let i in task) {
        taskList = taskList.concat(task[i]);
    }
    // 合并数据
    for(let i in taskList) {
        taskList[i]();
    }
    return list;
}

function updateList() {
    return ajaxGetRegion().then(res => {
        var data = rankData(res);
        var storage = JSON.stringify(data);
        util.setStorage('regionList', storage);
        return Promise.resolve(data);
    })
}

function getList() {
    return new Promise((resolve, reject) => {
        var regionList = util.getStorage('regionList');
        if(regionList) {
            resolve(JSON.parse(regionList));
        }else {
            updateList().then(data => {
                resolve(data);
            }).catch(e=>{
                reject(e);
            })
        }
    });
}

function getRegionId(regionName) {
    return getList().then(res => {
        for(let i in res) {
            if(res[i].name === regionName) {
                return Promise.resolve(res[i]);
            }
        }
        return Promise.reject(null);
    })
}

module.exports = {
  updateList: updateList,
  getList: getList,
  getRegionId: getRegionId
}
