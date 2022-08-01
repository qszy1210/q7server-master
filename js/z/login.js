/**
 * 模拟登陆
 */

$(function () {

    const $container = $("#container");

    cget('username').then(d=>{
        console.log('ddd', d)
        $('#username').val(d);
    })
    cget('password').then(d=>{
        console.log('ddd', d)
        $('#password').val(d);
    })



    $container.on('click', '#login', function () {
        const username = $('#username').val();
        const password = $('#password').val();
        getTokenFormLogin(username, password).then(d=>{
            console.log('ddd', d)
        }).then(d=>{
            refresh();
        });

        cset("username", username)
        cset("password", password)

        showUserInfo();
    })

})

function getTokenFormLogin(username, password) {
    return ajax({
        type: "POST",
        url: "http://ops.q7link.com:8080/api/loginapi",
        dataType: "json",
        data: {
            username,
            password,
        }
    }).then(d => {
        console.log(d);
        const token = d && d.data && d.data.token;
        return cset("token", token);
    })
}

/**
 * 通过 cookie 获取 token - old
 * return promise
 */
function getTokenFromCookie() {

    const url = "ops.q7link.com";
    const tokenKey = "vue_admin_template_token";

    return new Promise((rel, rej) => {
        let token;
        chrome.cookies.getAll({
            domain: url,
        }, cookies => {
            token = (cookies.find(c => c.name === tokenKey) || {}).value;
            console.log("token is", token);
            cset("token", token).then(d => {
                rel(token);
            }).finally(() => {
                rel(token);
            });
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

async function  getUserInfoByToken(token, isForce) {
    // const userInfo = await getUserInfoFromStorage();
    // if (userInfo && !isForce) {
    //     return userInfo;
    // }

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


async function showUserInfo($user) {
    if (!$user) {
        $user = $("#userinfo");
    }
    const token = await cget('token');
    const userInfo =await getUserInfoByToken(token);
    console.log('userinfo is ', userInfo);
    $user.html(`<span>${userInfo&&userInfo.name}</span>`);
}

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