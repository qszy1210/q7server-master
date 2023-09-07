/**
 * 我自己的 js 文件
 */

let force = false;

let tempServers = [];

$(function () {

    const $container = $("#container");


    zget("deploy_env").then(d=>{
        if (d) {
            $("#env").val(d)
            return;
        }
    });


    $("#search").focus();

    setTimeout(() => {
        $("#search")[0].setSelectionRange(0, $("#search").val().length);
    }, 10);

    // search default value
    zget('searchvalue').then(d=>{
        if (d) {
            $("#search").val(d);
            return;
        }
        $("#search").val('temp');
    });

    // auto enter

    $container.on('keypress', function(e){
        if (e.which == 13) {
            openUrl($('#serverList .link a').data('url'));
        }
    });





    initMergeRequestDefaultValue();

    refresh();

    const $user = $("#userinfo");
    //默认根据勾选去显示内容
    // showArea();
    getTokenFromCookie().then(d=>showUserInfo($user));


    zget("toggleEnableDeploy").then(d=>{
        //默认设置为 不启用
        if (!d) {
            $('#deploy').attr('disabled', 'disabled')
        }
    });

    //默认服务查询赋值 => 取消
    zget("j-query-status").then(d=>{
        if (d) {
            $('#j-query-status').val(d);
            // 默认触发查询
            // 默认不触发查询,但是默认值还是要填写的.
            // $('#b-query-status').trigger('click');
        }
    });


    // 点击快捷跳转
    ["test", "mobile"].forEach(text=>{
        $container.on("click", "#go-"+text, function (e) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const currentTab = tabs[0];
                const url = currentTab.url;
                const ret = /([^?]+)\??.*/.exec(url);
                if (ret.length>=1){
                    const baseUrl = ret[1];
                    chrome.tabs.create({ url: baseUrl + "?ui-"+text+"=t" });
                }
            })
        });
    });

    $container.on("click", "#go-q7navi", function (e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
        // chrome.tabs.create({url: chrome.runtime.getURL('options.html')});
        // window.open(chrome.runtime.getURL('options.html'));
        // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //     const currentTab = tabs[0];
        //     const url = currentTab.url;
        //     const ret = /([^?]+)\??.*/.exec(url);
        //     if (ret.length>=1){
        //         const baseUrl = ret[1];
        //         chrome.tabs.create({ url: baseUrl + "?ui-"+text+"=t" });
        //     }
        // })
    });

    // 点击链接
    $container.on("click", ".link a", function (e) {
        const url = $(e.target).data("url");
        chrome.tabs.create({ url });
    });

    // 搜索input
    $container.on("input", "#search", function (e) {
        console.log(e.target.value);
        render();
        zset("searchvalue", e.target.value);
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
            zset("toggleEnableDeploy", true);
        } else {
            $('#deploy').attr('disabled', 'disabled');
            zset("toggleEnableDeploy", false);
        }
        // zget("toggleEnableDeploy").then(d=>{
        //     //默认设置为 不启用
        //     zset("toggleEnableDeploy", !d);
        // });
    });

    // 部署服务
    $container.on("click", "#deploy", function (e) {

        zset("deploy_env", $("#env").val());

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

        zset("init-maven-branch", branch);

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

        zset("j-query-status", env);

        // records 为数组
        function callback(records) {
            if (records && records.length) {
                $('#r-query-status').text(`running: ${records.map(i=>JSON.parse(i.targetjob).join('-')).join(',')}`);
            } else {
                $('#r-query-status').text('没有运行中~' + countQuery++);
            }

        }
        fetchDeployStatus2(env, callback);

        fetchDeployBranch(env).then(branch=>{
            $('#r-query-status1').text(branch);
        });
    });

    // 快捷查询
    $container.on("dblclick", "#j-query-status", function (e) {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            fetchByDblClick(currentTab);
        })


        function fetchByDblClick(currentTab) {
            var currentEnv = /http.*(((localhost:\d+))|(com)|(cn))\/(.*)\/app/.exec(currentTab.url);
            if (currentEnv && currentEnv.length >=6) {
                $('#j-query-status').val(currentEnv[6]);
            } else {
                var backupEnv = /https?:\/\/(.*).(e7link|77hub).com.*/.exec(currentTab.url);
                if (backupEnv && backupEnv.length >=1) {
                    $('#j-query-status').val(backupEnv[1]);
                } else {
                    alert('环境不匹配,尝试调整正则吧!')
                }
            }
            return
            // 既然 return 了, 那么 注释一下  2023-09-07
            // var env = $('#j-query-status').val();
            // if (!env) {
            //     alert('不要乱搞-_-!');
            // }
            // zset("j-query-status", env);

            // // records 为数组
            // function callback(records) {
            //     if (records && records.length) {
            //         $('#r-query-status').text(`running: ${records.map(i => JSON.parse(i.targetjob).join('-')).join(',')}`);
            //     } else {
            //         $('#r-query-status').text('没有运行中~' + countQuery++);
            //     }

            // }
            // fetchDeployStatus2(env, callback);
        }
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

    $container.on('click', '#b_create_merge', function () {
        handleMergeRequest()
    })

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





