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

function getUserInfoFromStorage() {
    let userInfo = "";
    return new Promise(function(rel, rej) {
        chrome.storage.local.get({
            userInfo: ""
        }, function(items){
            userInfo = items.userInfo
            rel(userInfo)
        });
    })
}

async function  getUserInfo(token, isForce) {
    const userInfo = await getUserInfoFromStorage();
    if (userInfo && !isForce) {
        return userInfo;
    }

    const url = "http://ops.q7link.com:8080/api/qqauth/user/info";
    if (!token) {
        return getToken().then(token=>{
            ajax({
                url,
                headers: {
                    Token: token
                }
            })
        }).then(data=>{
            const userInfo = data && data.data && data.data;
            chrome.storage.local.set({
                userInfo
            });
            return userInfo;
        })
    } else {
        return ajax({
            url,
            headers: {
                Token: token
            },
            dataType: "json",
        }).then(data=>{
            const userInfo = data && data.data && data.data;
            chrome.storage.local.set({
                userInfo
            });
            return userInfo;
        })
    }

}