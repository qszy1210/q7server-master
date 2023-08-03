/**
 * 模拟登陆
 */

$(function () {

    const $container = $("#container");

    zget('username').then(d=>{
        console.log('ddd', d)
        $('#username').val(d);
    })
    zget('password').then(d=>{
        console.log('ddd', d)
        $('#password').val(d);
    })

    zget("init-maven-branch").then(d=>{
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

        zset("username", username)
        zset("password", password)

        showUserInfo();
    });

    function addButton() {
        let dynamicElement = $('.redirect-button');
         $.when(dynamicElement).then(dynamicElement.remove());
         $('.redirect-area').append('<div/>')

        zget("openArr").then(openArr=>{
            console.log(openArr);
            if (!openArr) return;
            openArr.forEach((link,index)=>{
                const linkArr = link.split("/");

                let content;
                if (linkArr.length > 0) {
                    content = linkArr[0]
                }
                if (linkArr.length > 1) {
                    content += "-" + linkArr[1].substr(0,1)
                }

                let extClass = "";
                if (link.includes('form')) {
                    // $('.redirect-area').append(`<button class="redirect-button button-orange" data-rrr="${link}">${content || "首页"}</button>`)
                    extClass = "button-form"
                }  else if (link.includes('list')) {
                    extClass = "button-list"
                } else if (link.includes('report')) {
                    extClass = "button-report"
                }

                // $('.redirect-area').remove('.redirect-button');
                $('.redirect-area').append(`<button class="redirect-button ${extClass}" data-rrr="${link}">${content || "首页"}</button>`)

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

    $container.on('contextmenu', '.redirect-button', async function ($obj) {
        $obj.preventDefault();
        const url = $($obj.target).attr('data-rrr');
        const arr = await zget("openArr") || [];
        const newArr = Array.from(new Set(arr));
        const index = newArr.findIndex(u => u === url);
        if (index > -1) {
            newArr.splice(index, 1);
            zset("openArr", Array.from(new Set(newArr))).then(d => {
                addButton();
            });
        }
    })

    $container.on('click', '#addRouter', async function ($btn) {
        const arr = await zget("openArr")||[];
        const tab = await getCurrentUrl();
        if (tab && tab.url) {
            const url = tab.url ;
            if (url.split('#').length > 1) {
                const newArr = Array.from(new Set(arr));
                newArr.unshift(url.split('#/')[1]);
                zset("openArr", Array.from(new Set(newArr))).then(d=>{
                    addButton();
                });
            }
        }
    })
    $container.on('click', '#clsRouter', function ($btn) {
        zset("openArr", "").then(d=>{
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
        return zset("token", token);
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
            zset("token", token).then(d => {
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

    if (!isForce) {
        // 如果请求时间距离上次不超过24小时, 那么不主动请求, 但是后台会异步进行请求, 如果获取不到的话, 会主动隐藏相关内容, 避免误操作;
        const cachedUserInfo = await zget("userInfo");
        if (cachedUserInfo && new Date().getTime() - cachedUserInfo["timestamp"] < 24*60*60*1000) {
            return cachedUserInfo
        }
    }

    if (!token) {
        return getToken().then(getUserInfo);
    } else {
        return getUserInfo(token);
    }

}

async function getUserInfo(token) {
    const url = "http://ops.q7link.com:8080/api/qqauth/user/info";
    const userInfo = await ajax({
        url,
        headers: {
            Token: token
        },
        type: "GET",
        dataType: "json"
    }).then(data => {
        console.log("data is", data);
        const userInfo = data && data.data && data.data;
        console.log('userinfo is', userInfo)
        return userInfo;
    });

    if(userInfo){
        // cache userinfo
        // 缓存一下, 避免每次都去请求
        userInfo["timestamp"] = new Date().getTime();
        await zset("userInfo", userInfo);
    }

    return userInfo;
}


async function showUserInfo($user, isForce) {
    if (!$user) {
        $user = $("#userinfo");
    }

    const token = await zget('token');
    const userInfo = await getUserInfoByToken(token, isForce);
    console.log('userinfo is ', userInfo);
    let showText = userInfo&&userInfo.name;

    if (!showText) {
        // hide
        $('.shadow').hide();
        showText = "http://ops.q7link.com:8080/#/login"
        $user.html(`<span class="link">空,<a style="color: red;" href="#" data-url="${showText}">去登录</a></span>`);
    } else {
        // show
        // $('.shadow').show();
        // showArea();
        $user.html(`<span class="link">${showText}</span>`);
    }

    return showText;
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