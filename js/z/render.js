/**
 * 处理界面的一些文件会都到这里
 */

function setDeployStatus(statusObj, $span) {
    const [front, end] = statusObj;
    // const {keyenv, status, targetjob} = front;
    // // const text = keyenv + status + targetjob;
    // const tj = JSON.parse(targetjob);
    // let tjStr = '';
    // if (tj.length) {
    //     tjStr = tj.join(",")
    // }
    $span.text(getStatusText(front)+";"+getStatusText(end));
}

function getStatusText(statusObj) {
    const {keyenv, status, targetjob} = statusObj;
    // const text = keyenv + status + targetjob;
    const tj = JSON.parse(targetjob);
    let tjStr = '';
    if (tj.length) {
        tjStr = tj.join(",")
    }
    return tjStr + ":" + status;
}

function setDeployInitStatus(statusArr, $span) {
    console.log(statusArr);
    getUserInfoFromStorage().then(user=>{
        const obj = statusArr.find(item=>item.runUser===(user&&user.name));
        $span.text(obj && obj.runStatus);
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
    currentAllServers.filter(s => {
        return s && s[0] && s[0].envName;
    }).sort((s1, s2) => {
        if (getNumber(s1[0].envName) == null) {
            return 999;
        }
        return getNumber(s1[0].envName) - getNumber(s2[0].envName);
    }).forEach(servers => {
        const filteredServer = searchKey && servers.filter(s => {
            const keys = searchKey.split(',');
            let contains = false;
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index];
                // 只要顺序匹配即可
                const envname =  s && s.envName;
                const reg = new RegExp(key.split('').join('.*'));
                if (reg.test(envname)) {
                    contains = true;
                    break;
                }
            }
            return contains;
        }) || servers;
        const [htmls, secondHtmls] = generateHtml(filteredServer);
        $container.append(`
        <tr>
        ${htmls.join("")}
        </tr>
        `);
        if (secondHtmls && secondHtmls.length) {
            $container.append(`
                <tr>
                ${secondHtmls.join("")}
                </tr>
                `);
        }
    })
}

function generateHtml(servers) {
    // let first, second
    // first = servers.slice(0, 2).sort((a, b) => {
    //     if (a.isTrek) {
    //         return 1
    //     } else {
    //         return -1
    //     }
    // }).map(renderItem);

    const first = servers.map(renderItem);

    const containsDomain = servers.find(i=>i.domain);
    containsDomain && first.unshift(
        `
        <td class="link">
        <a href="#" data-url="${containsDomain.domain}">${containsDomain.envName}</a>
        </td>
        `
    )

    // second = servers.slice(2).map(renderItem);
    // 数据返回格式有变, second 暂时不返回
    return [first, []];
}

function renderItem(server) {
    const { domain, envName, service } = server;
    let {serviceAddr} = server;
    // let domainLink = `http://graphql.${envName}.e7link.com/graphiql/index.html`;
    let domainLink = `https://${envName}.e7link.com/cn-global/login`;

    if (serviceAddr.indexOf('http')==-1) {
        serviceAddr = "http://" + serviceAddr
    }
    return `
        <td class="link">
        <a href="#" data-url="${serviceAddr}">${service}</a>
        </td>
        `;
};
