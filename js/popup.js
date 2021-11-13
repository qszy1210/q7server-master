/**
 * 我自己的 js 文件
 */

let force = false;

$(function() {
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

        // getServerList(token);

     });


     $container.on("click", ".link a", function(e) {
         const url = $(e.target).data("url");
         chrome.tabs.create({url});
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
                    const {assetUrl, envName, envHost} = server;
                    if (!assetUrl) return "";
                    const {ELK, GQL, NSQ} = assetUrl;
                    return {
                        assetUrl: {
                            ELK, GQL, NSQ
                        },
                        envName,
                        envHost,
                    }
                }).filter(i=>i);
                return servers;
            });
            chrome.storage.local.set({allServers: allServers});
            render(allServers);
        }
    })

    // $.ajax({
    //     url,
    //     headers: {
    //         Token: token
    //     },
    //     dataType: "json",
        // success: function(data){
        //     console.log(data);
        //     const servers = data && data.data;
        //     allServers.push(servers);
        // }
    // });

}

function render(allServers) {
    const $container = $("#container tbody");
    $container.empty();
    allServers.forEach(servers => {
        const htmls = generateHtml(servers);
        $container.append(`
        <tr>
        ${ htmls.join("") }
        </tr>
        `);
    })
}

function generateHtml(servers) {
    return servers.map(server=>{
        const {assetUrl, envName, envHost} = server;
        if (!assetUrl) return "";
        const {ELK, GQL, NSQ} = assetUrl;
        return `
        <td class="link">
        ${envName}: ${envHost}
        <a href="#" data-url="${ELK}">ELK</a>
        <a href="#" data-url="${GQL}">GQL</a>
        <a href="#" data-url="${NSQ}">NSQ</a>
        </td>
        `
    })
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

// jquery ajax with  promise
function ajax(options) {
    return new Promise(function (resolve, reject) {
      $.ajax(options).done(resolve).fail(reject);
    });
  }

