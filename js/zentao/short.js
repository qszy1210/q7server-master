$(function () {
    const $container = $("#container");
    $container.on('click', '#zentao-e', function ($obj) {
        chrome.tabs.getSelected(null, async function (tab) {
            const url = tab.url;
            const newUrl = url.replace(/(.*)(-view-)(.*)/, function(m, p1, p2, p3){
                return p1+"-edit-"+p3;
            });
            console.log(newUrl);
            await chrome.tabs.update(tab.id, {url: newUrl});
            // await chrome.windows.update(tab.windowId, {url: newUrl});
        });

        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, { key: "edit" }, function (response) {
                console.log(response);
            });
        });
    })
})