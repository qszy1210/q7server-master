/**
 * 我自己的 js 文件
 */

let force = false;

let tempServers = [];

$(function () {

    $("#search").focus();
    $("#search").val('temp');

    refresh();

    const $user = $("#userinfo");
    getTokenFromCookie().then(d=>showUserInfo($user));


    const $container = $("#container");

    // 点击链接
    $container.on("click", ".link a", function (e) {
        const url = $(e.target).data("url");
        chrome.tabs.create({ url });
    });

    // 搜索input
    $container.on("input", "#search", function (e) {
        console.log(e.target.value);
        render();
    });

    // 刷新服务列表信息
    $container.on("click", "#forceResfresh", function (e) {
        force = true;
        refresh();
    });

    // 部署服务
    $container.on("click", "#deploy", function (e) {
        var $button = $(this);
        function callback(data) {
            // $button.text('deploying');
            // fetchDeployStatus((obj) => {
            //     setDeployStatus(obj, $("#deployStatus"))
            // });
            if (data && data.msg) {
                $('#deployStatus').html(`<span style="color: red;">${data.msg}</span>`);
            } else {
                $('#deployStatus').text('部署中...');
            }

        }
        const options = {};
        options.env = $('#env').val();
        options.servers = [];
        if ($('#trek').is(":checked")) {
            options.servers.push('trek');
        }
        if ($('#web').is(":checked")) {
            options.servers.push('web');
        }
        if ($('#apps').is(":checked")) {
            options.servers.push('apps');
        }
        if ($('#h5').is(":checked")) {
            options.servers.push('h5');
        }
        deploy(options, callback);
    });

    // 部署 jenkins
    $container.on("click", "#initMavenDeploy", function (e) {
        var $button = $(this);
        var branch = $('#j-branch').val();
        const options = {
            branch
        };

        cset("init-maven-branch", branch);

        function callback(data) {
            // $button.text('deploying');
            // fetchDeployStatus((obj) => {
            //     setDeployStatus(obj, $("#deployStatus"))
            // });
            if (data && data.msg) {
                $('#deployStatus').html(`<span style="color: red;">${data.msg}</span>`);
            } else {
                $('#deployStatus').text('部署init-maven中...');
            }

        }
        initMavenDeploy(options, callback);
    });



    $container.on("click", "#toggle", function (e) {
        //快速部署 temp13 环境
        // $('#deploy-area').toggle();
        // zGet('toggle').then(d => {
        //     zSet("toggle", !d);
        // })
        //  const env = ['trek', 'web'];
        //  deploy(env);
    });


    // 获取部署信息
    $container.on("click", "#fetchDeployStatus", function (e) {
        fetchDeployStatus((obj) => {
            setDeployStatus(obj, $("#deployStatus"))
        });
    });

    // 部署 jenkins
    $container.on("click", "#deployInit", function (e) {
        const params = {};
        const callback = function () { };
        deployInit(params, callback);
    });

    //获取  front-publish-init-data-maven 状态
    $container.on("click", "#fetchDeployInitStatus", function (e) {
        fetchDeployInitStatus(obj => {
            setDeployInitStatus(obj, $("#deployInitStatus"))
        })
    });


    $(document).on("onServerListReady", function (event, serverList) {
        var token = ""
        chrome.storage.local.get({
            token: ""
        }, function (items) {
            token = items.token;
            getServerInfo(serverList, token);
        });

    });

    //默认打开获取状态
    // (function () {
    //     fetchDeployStatus((obj) => {
    //         setDeployStatus(obj, $("#deployStatus"))
    //     });
    //     fetchDeployInitStatus(obj => {
    //         setDeployInitStatus(obj, $("#deployInitStatus"))
    //     })
    // })()


});





