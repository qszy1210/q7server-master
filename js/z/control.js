$(function () {

    const $container = $("#container");

    ["controller-deploy",
        "controller-init-maven",
        "controller-deploy-info",
        "controller-backend-compile",].forEach(id => {

            const ccc = 'control-info';

             // 初始 control 值
            zget(ccc).then(d => {
                if (d[id]) {
                    $(`#${id}`).attr("checked", true);
                }
            });

            $container.on('click', `#${id}`, async evt=>{

                const checked = $(evt.target).is(':checked');

                const cInfo = await zget(ccc)||{};
                cInfo[id] = checked;
                await zset(ccc, cInfo);

                if (checked) {
                    $(`.shadow[data-rel='${id}']`).show();
                } else {
                    $(`.shadow[data-rel='${id}']`).hide();
                }
            });

        });

})

function showArea() {
    ["controller-deploy",
        "controller-init-maven",
        "controller-deploy-info",
        "controller-backend-compile",].forEach(id => {
            const checked = $('#' + id).is(':checked');
            if (checked) {
                $(`.shadow[data-rel='${id}']`).show();
            } else {
                $(`.shadow[data-rel='${id}']`).hide();
            }
        });
}