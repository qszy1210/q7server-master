var source_node;
var popover;

document.addEventListener('click', function () {
    // source_node.style.display = 'block';
    // popover.style.display = 'none';
});

function showPopover(curr, url) {
    if (source_node != null) {
        source_node.style.display = 'block';
    }
    if (popover != null) {
        popover.style.display = 'none';
    }
    source_node = curr.parentNode.parentNode;
    popover = source_node.parentNode.children[2];
    popover.children[0].children[1].innerHTML = url
    // alert(popover.children[0].children[1].innerHTML);
    // popover.children[0].children[0]

    popover.style.display = 'block';
    source_node.style.display = 'none';

    popover.addEventListener('click', function (e) {
        e.stopPropagation();  //点击浮层区域不会使其隐藏
    });
    event.stopPropagation();
}

function openPage(app) {
    env_name = event.target.parentNode.parentNode.parentNode.parentNode.children[1].innerHTML;
    domain = '';
    if (env_name.startsWith('cn-northwest')) {
        domain = env_name + '.77hub.com';
    } else {
        domain = env_name + '.e7link.com';
    }
    url = '#';
    if (app == 'login') {
        if (domain.startsWith('cn-northwest')) {
            url = 'https://app.77hub.com/cn-global/login';
        } else if (env_name.includes('aws')) {
            url = 'https://' + env_name + '-global.e7link.com/cn-global/login';
        } else {
            url = 'https://' + domain + '/cn-global/login';
        }
    } else if (app == 'GraphQL') {
        url = 'http://graphql.' + domain + '/index.html';
    } else if (app == 'elk') {
        if (domain.startsWith('cn-northwest')) {
            url = "http://kibana.prod.77hub.com/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(_source),filters:!(),index:'6aab3990-c54e-11ec-9d0d-3fe0837c3470',interval:auto,query:(language:kuery,query:'kubernetes.namespace_name%20:%20%22" + env_name + "%22'),sort:!())";
        } else if (domain.startsWith('test-tx') || domain.startsWith('nx-tencent')) {
            url = "http://kibana.tencent.e7link.com/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(_source),filters:!(),index:'12c208d0-be50-11ec-ad8b-8f659869edd9',interval:auto,query:(language:kuery,query:'namespace%20:%20%22" + env_name + "%22'),sort:!())";
        } else {
            url = "http://kibana.test.e7link.com/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(_source),filters:!(),index:'12c208d0-be50-11ec-ad8b-8f659869edd9',interval:auto,query:(language:kuery,query:'kubernetes.namespace_name%20:%20%22" + env_name + "%22'),sort:!())";
        }
    } else if (app == 'global-GraphQL') {
        if (domain.startsWith('cn-northwest')) {
            url = 'http://identity.cn-northwest-global.77hub.com/index.html';
        } else if (env_name.includes('aws')) {
            url = 'https://identity.' + env_name + '-global.e7link.com/index.html';
        } else {
            url = 'http://identity.' + domain + '/index.html';
        }
    } else if (app == 'global-elk') {
        if (domain.startsWith('cn-northwest')) {
            url = "http://kibana.prod.77hub.com/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(_source),filters:!(),index:'6aab3990-c54e-11ec-9d0d-3fe0837c3470',interval:auto,query:(language:kuery,query:'kubernetes.namespace_name%20:%20%22cn-northwest-global%22'),sort:!())";
        }
    } else if (app == 'qbos') {
        if (domain.startsWith('cn-northwest')) {
            url = "http://qbos.77hub.com"
        } else {
            url = 'http://qbos.' + domain + '/index.html';
        }
    }
    // alert(url);
    window.open(url, "_self");
}

function search_tenant() {
    var key = $("#kw-2").val();
    if (key == '') {
        return;
    }
    var _data = {
    }
    _data["query"] = "{ Tenant(criteriaStr: \"name like '%" + key + "%' or id like '%" + key + "%'\", maxResult:5) {id,name,clusterId}}";

    $.ajax({
        type: "POST",
        url: "http://identity.cn-northwest-global.77hub.com/identity/graphql/withoutAuth",
        beforeSend: function (request) {
            request.setRequestHeader("Tenant-Id", "0");
            request.setRequestHeader("Content-Type", "application/json");
        },
        data: JSON.stringify(_data),
        dataType: "json",
        success: function (result) {
            var tenants = result["data"]["Tenant"]
            var rst_text = "";
            for (i in result["data"]["Tenant"]) {
                // alert(tenants[i]["id"]);
                rst_text += "<a>" + tenants[i]["clusterId"] + "&emsp;|&emsp;" + tenants[i]["id"] + "&emsp;|&emsp;" + tenants[i]["name"] + "</a><br>"

            }
            $("#search_text").html(rst_text)
        }
    });

}

document.addEventListener('click', function () {
    popover.style.display = 'none';
});


$(function () {
    $(document).on('click', "#su-2", function () {
        search_tenant();
    });
    $(document).on('submit', "#search_form", function (e) {
        e.preventDefault();
        search_tenant();
    });
    // onclick="search_tenant()"
})