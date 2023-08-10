$(function () {

    const $container = $("#container");
    const ids = ["controller-deploy",
        "controller-init-maven",
        "controller-deploy-info",
        "controller-backend-compile", "controller-merge-request"];

    const ccc = 'control-info';

    ids.forEach(id => {
        $container.on('click', `#${id}`, async evt => {

            const checked = $(evt.target).is(':checked');

            const cInfo = await zget(ccc) || {};
            cInfo[id] = checked;
            await zset(ccc, cInfo);

            if (checked) {
                $(`.shadow[data-rel='${id}']`).show();
            } else {
                $(`.shadow[data-rel='${id}']`).hide();
            }
        });

    });

    Promise.all(ids.map(id=>{
         // 初始 control 值
         return zget(ccc).then(d => {
            if (d[id]) {
                $(`#${id}`).attr("checked", true);
            }
        });
    })).then(d=>{
        showArea();
    })


})

function showArea() {
    ["controller-deploy",
        "controller-init-maven",
        "controller-deploy-info",
        "controller-backend-compile","controller-merge-request"].forEach(id => {
            const checked = $('#' + id).is(':checked');
            if (checked) {
                $(`.shadow[data-rel='${id}']`).show();
            } else {
                $(`.shadow[data-rel='${id}']`).hide();
            }
        });
}
