chrome.extension.onMessage.addListener(
    function (request, sender, sendMessage) {
        if (request.key == "edit") {
            $("[title='编辑']").trigger('click');
            sendMessage('ok');
        }
    }
);