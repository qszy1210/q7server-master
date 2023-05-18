/**
 * 我自己的 js 文件
 */

let force = false;

let tempServers = [];

$(function () {

    $("#search").focus();

    cget('searchvalue').then(d=>{
        if (d) {
            $("#search").val(d);
            return;
        }
        $("#search").val('temp');
    })

    refresh();

    const $user = $("#userinfo");
    getTokenFromCookie().then(d=>showUserInfo($user));


    cget("toggleEnableDeploy").then(d=>{
        //默认设置为 不启用
        if (!d) {
            $('#deploy').attr('disabled', 'disabled')
        }
    });

    //默认服务查询赋值
    cget("j-query-status").then(d=>{
        if (d) {
            $('#j-query-status').val(d);
            $('#b-query-status').trigger('click');
        }
    });


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
        cset("searchvalue", e.target.value);
    });

    // 刷新服务列表信息
    $container.on("click", "#forceResfresh", function (e) {
        force = true;
        refresh();
    });

    //启用部署
    $container.on("click", "#toggleEnableDeploy", function (e) {
        if ($('#deploy').attr('disabled')) {
            $('#deploy').removeAttr('disabled');
            cset("toggleEnableDeploy", true);
        } else {
            $('#deploy').attr('disabled', 'disabled');
            cset("toggleEnableDeploy", false);
        }
        // cget("toggleEnableDeploy").then(d=>{
        //     //默认设置为 不启用
        //     cset("toggleEnableDeploy", !d);
        // });
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
        if (!branch) {
            alert('不要乱搞-_-!')
        }
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

    var countQuery  = 0;
    // 查询服务
    $container.on("click", "#b-query-status", function (e) {
        var env = $('#j-query-status').val();
        if (!env) {
            alert('不要乱搞-_-!')
        }
        // const options = {
        //     branch: env
        // };

        cset("j-query-status", env);

        // records 为数组
        function callback(records) {
            if (records && records.length) {
                $('#r-query-status').text(`running: ${records.map(i=>JSON.parse(i.targetjob).join('-')).join(',')}`);
            } else {
                $('#r-query-status').text('没有运行中~' + countQuery++);
            }

        }
        fetchDeployStatus2(env, callback);
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





