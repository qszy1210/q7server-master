/**
 * 我自己的 js 文件
 */

let force = false;

let tempServers = [];

$(function() {

    $("#search").focus();
    $("#search").val('temp');

    refresh();

    const $user = $("#userInfo");
    const $container = $("#container");

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

    //  zGet('toggle').then(d=>{
    //      if (d) {
    //         $('#deploy-area').show();
    //      } else {
    //         $('#deploy-area').hide();
    //      }
    //  })

     $container.on("click", "#toggle", function(e) {
         //快速部署 temp13 环境
         $('#deploy-area').toggle();
         zGet('toggle').then(d=>{
            zSet("toggle", !d);
         })
        //  const env = ['trek', 'web'];
        //  deploy(env);
     });
     $container.on("click", "#startDeploy", function(e) {
         var $button = $(this);
         //快速部署 temp13 环境
         const env = [];
         if($('#web').is(":checked")){
             env.push('web')
         }
         if($('#trek').is(":checked")){
             env.push('trek')
         }
         if($('#apps').is(":checked")){
             env.push('apps')
         }
         function callback() {
            $button.text('deploying');
            fetchDeployStatus((obj)=>{
                setDeployStatus(obj, $("#deployStatus"))
            });
         }
         deploy(env, callback);
     });
    $container.on("click", "#fetchDeployStatus", function (e) {
        fetchDeployStatus((obj) => {
            setDeployStatus(obj, $("#deployStatus"))
        });
    });
     $container.on("click", "#deployInit", function(e) {
         const params = {};
         const callback = function(){};
         deployInit(params, callback);
     });

     //获取  front-publish-init-data-maven 状态
     $container.on("click", "#fetchDeployInitStatus", function(e) {
        fetchDeployInitStatus(obj=>{
            setDeployInitStatus(obj, $("#deployInitStatus"))
        })
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

     //默认打开获取状态

     (function() {
        fetchDeployStatus((obj) => {
            setDeployStatus(obj, $("#deployStatus"))
        });
        fetchDeployInitStatus(obj=>{
            setDeployInitStatus(obj, $("#deployInitStatus"))
        })
     })()


});




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

//查询部署状态
function fetchDeployStatus(callback) {
    const url = "http://ops.q7link.com:8080/api/qqdeploy/oneclickdeploy/?page=1&limit=20&targetEnv=nx-temp13";
    ajaxWithToken({
        type: "GET",
        dataType: "json",
        url
    }).then(data=>{
        const record = data && data.data && data.data.record && data.data.record;
        const web = record.filter(item=>item.targetjob.indexOf('web')>-1 || item.targetjob.indexOf('trek')>-1);
        const apps = record.filter(item=>item.targetjob.indexOf('apps')>-1);

        typeof callback === 'function' && callback([web[0], apps[0]])
    })
}
//部署 front-publish-init-data-maven
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

function fetchDeployInitStatus(cb) {
    const url = "http://ops.q7link.com:8080/api/qqdeploy/jenkinsjob/?page=1&limit=10";
    getToken().then(token=>{
        ajax({
            type: "GET",
            url,
            headers: {token},
            dataType: "json",
        }).then(d=>{
            typeof cb === 'function' && cb(d&&d.data);
        })
    })
}

//部署 front-update-dependency
function deployUpdate(params, cb) {
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
                    jobName: "front-update-dependency",
                    jobParams: `[{"_class":"hudson.model.StringParameterDefinition","defaultParameterValue":{"_class":"hudson.model.StringParameterValue","name":"Branch","value":"feature-inventory"},"description":"自定义分支","name":"Branch","type":"StringParameterDefinition"},{"_class":"hudson.model.BooleanParameterDefinition","defaultParameterValue":{"_class":"hudson.model.BooleanParameterValue","name":"COMMIT","value":true},"description":"是否需要提交代码","name":"COMMIT","type":"BooleanParameterDefinition"},{"_class":"hudson.model.BooleanParameterDefinition","defaultParameterValue":{"_class":"hudson.model.BooleanParameterValue","name":"IMAGE","value":false},"description":"是否需要制作镜像","name":"IMAGE","type":"BooleanParameterDefinition"}]`
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



