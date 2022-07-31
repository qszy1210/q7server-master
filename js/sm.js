/**
 * 我自己的 js 文件
 */



// 将获取token的方法更改为一个promise
function getToken() {
    let token = "";
    return new Promise(function(rel, rej) {
        chrome.storage.local.get({
            token: ""
        }, function(items){
            token = items.token
            rel(token)
        });
    })
}



//请求ajax的时候, 默认带上 token
function ajaxWithToken(options) {
    return getToken().then(token=>{
        return ajax({
            ...options,
            headers:{
                token
            }
        })
    })
}

function zGet(key) {
    let value = "";
    return new Promise(function(rel, rej) {
        chrome.storage.local.get({
            key: ""
        }, function(items){
            value = items.key
            rel(value)
        });
    })
};

function zSet(key ,val) {
    return new Promise(function(rel, rej) {
        chrome.storage.local.set({
            key: val
        });
    })
};