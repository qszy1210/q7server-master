chrome.extension.onMessage.addListener(
    function (request, sender, sendMessage) {
        if (request.key == "edit") {
            $("[title='编辑']").trigger('click');
            sendMessage('ok');
        }
    }
);

if (/.*gitlab.q7link.com.*repository\?page.*/.test(window.location.href)) {
    $(document).ready(function () {
        const $targetDom = $('#js-protected-branches-settings');
        if ($targetDom && $targetDom.attr('class').indexOf('expanded') === -1) {
            $targetDom.attr('class', $targetDom.attr('class') + '  expanded')
        }
    });
}