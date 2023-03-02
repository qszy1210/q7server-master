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

    cget("init-maven-branch").then(d=>{
        $('#j-branch').val(d);
    });



    $container.on('click', '#login', function () {
        const username = $('#username').val();
        const password = $('#password').val();
        // getTokenFormLogin(username, password).then(d=>{
        getTokenFromCookie().then(d=>{
            console.log('ddd', d)
        }).then(d=>{
            refresh();
        });

        cset("username", username)
        cset("password", password)

        showUserInfo();
    });

    function addButton() {
        let dynamicElement = $('.redirect-button');
         $.when(dynamicElement).then(dynamicElement.remove());
         $('.redirect-area').append('<div/>')

        cget("openArr").then(openArr=>{
            console.log(openArr);
            if (!openArr) return;
            openArr.forEach((link,index)=>{
                const content = link.split("/")[0];
                // $('.redirect-area').remove('.redirect-button');
                $('.redirect-area').append(`<button class="redirect-button" data-rrr="${link}">${content}</button>`)
            })
        })
    }

    addButton(); // call at once
    $container.on('click', '.redirect-button', function ($obj) {
        // const i = $($obj.target).index();
        chrome.tabs.getSelected(null, async function (tab) {
            const url = tab.url;
            const newUrl = url.replace(/(.*#\/)(.*)/, function(m, p1, p2){
                return p1 + $($obj.target).attr('data-rrr');
            });
            await chrome.tabs.update(tab.id, {url: newUrl});
            // await chrome.windows.update(tab.windowId, {url: newUrl});
        });
    })

    $container.on('click', '#addRouter', async function ($btn) {
        const arr = await cget("openArr")||[];
        const tab = await getCurrentUrl();
        if (tab && tab.url) {
            const url = tab.url ;
            if (url.split('#').length > 1) {
                const newArr = Array.from(new Set(arr));
                newArr.push(url.split('#/')[1]);
                cset("openArr", Array.from(new Set(newArr))).then(d=>{
                    addButton();
                });
            }
        }
    })
    $container.on('click', '#clsRouter', function ($btn) {
        cset("openArr", "").then(d=>{
            addButton();
        });
    })
})

// 直接登录设置 token 会导致原来的登录生效
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
            console.log("token from cookie is", token);
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
            console.log('userinfo is', userInfo)
            // chrome.storage.local.set({
            //     userInfo
            // });
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
            console.log('userinfo is', userInfo)
            // chrome.storage.local.set({
            //     userInfo
            // });
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
    let showText = userInfo&&userInfo.name;
    if (!showText) {
        showText = "http://ops.q7link.com:8080/#/login"
        $user.html(`<span class="link">空,<a style="color: red;" href="#" data-url="${showText}">去登录</a></span>`);
    } else {
        $user.html(`<span class="link">${showText}</span>`);
    }
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


  async function getCurrentUrl() {
	return new Promise((rel, rej)=>{
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			rel(tabs[0])
		});
	})
}