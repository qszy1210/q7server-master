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