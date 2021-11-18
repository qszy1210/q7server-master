/**
 * 我自己的 js 文件
 */

let force = false;

let tempServers = [];

$(function() {

    $("#search").focus();

    const $user = $("#userInfo");
    const $container = $("#container");
    const url = "ops.q7link.com";
    const tokenKey = "vue_admin_template_token";
    let token;
     chrome.cookies.getAll({
        domain: url,
     }, cookies => {
         token = (cookies.find(c=>c.name===tokenKey)||{}).value;
         $user.text(token);
        console.log("token is", token);
        chrome.storage.local.set({
            token
        });
        $(document).trigger("onTokenReady", token);

        getUserInfo(token, force).then(data=>{
            const name = data.name;
            $user.text(name);
        })

        // getServerList(token);

     });


     $container.on("click", ".link a", function(e) {
         const url = $(e.target).data("url");
         chrome.tabs.create({url});
     });
     $container.on("input", "#search", function(e) {
        console.log(e.target.value);
        render();
     });
     $container.on("click", "#forceResfresh", function(e) {
        force = true;
        refresh();
     });
     $container.on("click", "#toggle", function(e) {
         //快速部署 temp13 环境
         $('#deploy-area').toggle();
        //  const env = ['trek', 'web'];
        //  deploy(env);
     });
     $container.on("click", "#startDeploy", function(e) {
         //快速部署 temp13 环境
         const env = [];
         if($('#web').is(":checked")){
             env.push('web')
         }
         if($('#trek').is(":checked")){
             env.push('trek')
         }
         function callback() {
             $(this).text('deploying');
         }
         deploy(env, callback);
     });
     $container.on("click", "#deployInit", function(e) {
         const params = {};
         const callback = function(){};
         deployInit(params, callback);
     });


     $(document).on("onTokenReady", function() {
        var token = ""
        chrome.storage.local.get({
            token: ""
        }, function(items){
            token = items.token
            getServerList(token);
        });
     });

     $(document).on("onServerListReady", function(event, serverList) {
        var token = ""
        chrome.storage.local.get({
            token: ""
        }, function(items){
            token = items.token;
            getServerInfo(serverList, token);
        });

     });

});

//刷新数据
function refresh() {
    var token = ""
    chrome.storage.local.get({
        token: ""
    }, function(items){
        token = items.token
        getServerList(token);
    });
}

//部署环境,  env 为一个数组字符串
function deploy(env, cb) {
    if(!env || !env.length) return;
    const url = "http://ops.q7link.com:8080/api/qqdeploy/oneclickdeploy/";
        //  const url = "http://ops.q7link.com:8080/api/qqdeploy/oneclicktemplate/?testOwnerEnv=true";
        getToken().then(token=>{
            ajax({
                type: "POST",
                url,
                headers: {
                    token
                },
                data: {
                    "templateenv": "nx-temp13",
                    "targetjob": env.join(",") //"web,trek"
                }
            }).then(d=>{
                // console.log('deployying', d);
                // $(this).val("deployying");
                typeof cb === 'function' && cb();
            })
        })
}
//部署init
function deployInit(params, cb) {
    const url = "http://ops.q7link.com:8080/api/qqdeploy/jenkinsjob/";
        getToken().then(token=>{
            ajax({
                type: "POST",
                url,
                headers: {
                    token
                },
                // contentType: "application/json",
                data: {
                    jobName: "front-publish-init-data-maven",
                    jobParams: `[{"_class":"hudson.model.StringParameterDefinition","defaultParameterValue":{"_class":"hudson.model.StringParameterValue","name":"Branch","value":"feature-inventory"},"description":"自定义分支","name":"Branch","type":"StringParameterDefinition"},{"_class":"hudson.model.BooleanParameterDefinition","defaultParameterValue":{"_class":"hudson.model.BooleanParameterValue","name":"release","value":false},"description":"是否生成生产release包","name":"release","type":"BooleanParameterDefinition"}]`
                    // jobParams: [{
                    //     "_class": "hudson.model.StringParameterDefinition",
                    //     "defaultParameterValue": {
                    //         "_class": "hudson.model.StringParameterValue",
                    //         "name": "Branch",
                    //         "value": "feature-inventory"
                    //     },
                    //     "description": "自定义分支",
                    //     "name": "Branch",
                    //     "type": "StringParameterDefinition"
                    // },
                    // {
                    //     "_class": "hudson.model.BooleanParameterDefinition",
                    //     "defaultParameterValue": {
                    //         "_class": "hudson.model.BooleanParameterValue",
                    //         "name": "release",
                    //         "value": false
                    //     },
                    //     "description": "是否生成生产release包",
                    //     "name": "release",
                    //     "type": "BooleanParameterDefinition"
                    // }]
                }
            }).then(d=>{
                // console.log('deployying', d);
                // $(this).val("deployying");
                typeof cb === 'function' && cb();
            })
        })
}

/**
 * 根据 token 获取server信息,并且将内容render到对应的$container中
 */
function getServerInfo(serverList, token) {
    let allServers = [];
    chrome.storage.local.get({allServers}, function(items){
        allServers = items.allServers;
        if (allServers && allServers.length && !force) {
            render(allServers);
            return;
        } else {
            doGetServerInfo(serverList, token);
            if (force) {
                force = false;
            }
        }

    });
}
function doGetServerInfo(serverList, token) {
    // const url = "http://ops.q7link.com:8080/api/qqtools/serverinfo/?page=1&limit=99&env=nx-temp13";
    const url = "http://ops.q7link.com:8080/api/qqtools/serverinfo/?page=1&limit=99&env=";
    if (!serverList || !serverList.length)return;
    const requests = serverList.map(i=>url+i);

    Promise.all(requests.map(r=>ajax({
        url: r,
        headers: {
            Token: token
        },
        dataType: "json",
    }))).then(dataArr=>{
        if (dataArr && dataArr.length) {
            const allServers = dataArr.map(data=>{
                const servers = data && data.data && data.data.map(server=>{
                    const {assetUrl, envName, envHost, domain} = server;
                    if (!assetUrl) return "";
                    const {ELK, GQL, NSQ} = assetUrl;
                    return {
                        assetUrl: {
                            ELK, GQL, NSQ
                        },
                        envName,
                        envHost,
                        domain,
                    }
                }).filter(i=>i);
                return servers;
            });
            chrome.storage.local.set({allServers: allServers});
            render(allServers);
        }
    })

}

function render(allServers) {
    let currentAllServers = [];
    if (allServers && allServers.length) {
        currentAllServers = allServers;
        tempServers = allServers;
    } else {
        currentAllServers = tempServers
    }
    const $container = $("#container tbody");
    $container.empty();
    const searchKey = $("#search").val();
    console.log("currentAllServers is ", currentAllServers);
    currentAllServers.filter(s=>{
      return s&&s[0]&&s[0].envName;
    }).sort((s1,s2)=>{
        if (getNumber(s1[0].envName)==null) {
            return 999;
        }
        return getNumber(s1[0].envName) - getNumber(s2[0].envName);
    }).forEach(servers => {
        const filteredServer = searchKey && servers.filter(s=>s&&s.envName.indexOf(searchKey)>-1) || servers;
        const [htmls, secondHtmls] = generateHtml(filteredServer);
        $container.append(`
        <tr>
        ${ htmls.join("") }
        </tr>
        `);
        if (secondHtmls && secondHtmls.length) {
            $container.append(`
                <tr>
                ${ secondHtmls.join("") }
                </tr>
                `);
        }
    })
}

function generateHtml(servers) {
    let first, second
    first =  servers.slice(0,2).map((server,index)=>{
        const {assetUrl, envName, envHost,domain} = server;
        if (!assetUrl) return "";
        const {ELK, GQL, NSQ} = assetUrl;
        return `
        <td class="link">
        <span class="highlight"><a href="#" data-url="${domain}">${envName}</a></span>: ${envHost}
        <a href="#" data-url="${ELK}">ELK</a>
        <a href="#" data-url="${GQL}">GQL</a>
        <a href="#" data-url="${NSQ}">NSQ</a>
        </td>
        `
    });
    second =  servers.slice(2).map((server,index)=>{
        const {assetUrl, envName, envHost} = server;
        if (!assetUrl) return "";
        const {ELK, GQL, NSQ} = assetUrl;
        return `
        <td class="link">
        <span class="highlight">${envName}</span>: ${envHost}
        <a href="#" data-url="${ELK}">ELK</a>
        <a href="#" data-url="${GQL}">GQL</a>
        <a href="#" data-url="${NSQ}">NSQ</a>
        </td>
        `
    });
    return [first,second];
}

function getServerList(token) {
    var serverList = ""
    chrome.storage.local.get({
        serverList: ""
    }, function(items){
        serverList = items.serverList;
        doGetServerList(serverList, token);
    });
}

function doGetServerList(serverList, token) {
    const url = "http://ops.q7link.com:8080/api/qqsystem/busenv/?page=1&limit=99";
    if (serverList && serverList.length && !force) {
        $(document).trigger("onServerListReady", [serverList]);
        return;
    }
    return $.ajax(
        {
            url,
            type: "GET",
            headers: {
                Token: token
            },
            contentType: "application/json",
            dataType: "json",
            success: function(data){
                const serverList = data && data.data &&data.data.map(i=>i.envName);
                chrome.storage.local.set({
                    serverList
                });
                //getServerInfo(serverList, token);
                $(document).trigger("onServerListReady", [serverList]);
            }
        })
}



// 将获取token的方法更改为一个promise
// function getToken() {
//     let token = "";
//     return new Promise(function(rel, rej) {
//         chrome.storage.local.get({
//             token: ""
//         }, function(items){
//             token = items.token
//             rel(token)
//         });
//     })
// }