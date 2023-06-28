/**
 * 获取服务器信息
 */

//刷新数据
function refresh() {
    var token = ""
    chrome.storage.local.get({
        token: ""
    }, function (items) {
        token = items.token
        getServerList(token);
    });
}

function getServerList(token) {
    var serverList = ""
    chrome.storage.local.get({
        serverList: ""
    }, function (items) {
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
            success: function (data) {
                const serverList = data && data.data && data.data.map(i => i.envName);
                chrome.storage.local.set({
                    serverList
                });
                //getServerInfo(serverList, token);
                $(document).trigger("onServerListReady", [serverList]);
            }
        })
}

/**
 * 根据 token 获取server信息,并且将内容render到对应的$container中
 */
function getServerInfo(serverList, token) {
    let allServers = [];
    chrome.storage.local.get({ allServers }, function (items) {
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
    if (!serverList || !serverList.length) return;
    const requests = serverList.map(i => url + i);

    Promise.all(requests.map(r => ajax({
        url: r,
        headers: {
            Token: token
        },
        dataType: "json",
    }))).then(dataArr => {
        if (dataArr && dataArr.length) {
            const filterKeys = [
                "Gql工具地址",
                "日志ELK",
                "graphql",
            ]
            const allServers = dataArr.map(data => {
                const servers = data && data.data && data.data.length && data.data.filter(i => i && filterKeys.includes(i.service)).map(server => {
                    const { domain, envName, service, serviceAddr } = server;
                    // const isTrek = !!(deployService && deployService.length && deployService.find(item=>item.indexOf('trek')>-1));
                    return {
                        domain, envName, service, serviceAddr
                        // isTrek,
                    }
                }).filter(i => i);
                return servers;
            });
            chrome.storage.local.set({ allServers: allServers });
            render(allServers);
        }
    })

}


