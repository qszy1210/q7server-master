
//部署环境
// deployInfo: {env: string, servers: string[]}
// env : 具体的地址, 比如 nx-temp13
// servers: 具体的服务, 比如 trek, web, apps
// cb 部署完执行的回调操作
function deploy(deployInfo, cb) {
    const url = "http://ops.q7link.com:8080/api/qqdeploy/oneclickdeploy/";

    const {env, servers} = deployInfo;
    if (!servers || !servers.length) {
        console.error('传递部署参数错误')
    }

    ajax({
        type: "POST",
        url,
        dataType: "json",
        data: {
            "templateenv": env,
            "targetjob": servers.join(",") //"web,trek"
        }
    }).then(d => {
        typeof cb === 'function' && cb(d);
    }, error=>{
        alert('部署失败');
    }).catch(d=>{
        alert("部署失败");
    })
}

function checkDeployAuth() {
    const url = 'http://ops.q7link.com:8080/api/qqdeploy/oneclicktemplate/?testOwnerEnv=true';

    ajax({
        type: "GET",
        url,
    })


}


//查询部署状态
function fetchDeployStatus(callback) {
    const url = "http://ops.q7link.com:8080/api/qqdeploy/oneclickdeploy/?page=1&limit=20&targetEnv=nx-temp13";
    ajax({
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


// 部署 jenkins 服务
// 暂时不提供外部传入
function initMavenDeploy(options, cb) {
    const url = "http://ops.q7link.com:8080/api/qqdeploy/jenkinsjob/";

    const {jobName="front-publish-init-data-maven", branch="feature-purchase"}  = options;

    const data= {
        "jobName": jobName,
        "jobParams": `[{"_class":"hudson.model.StringParameterDefinition","defaultParameterValue":{"_class":"hudson.model.StringParameterValue","name":"Branch","value":"${branch}"},"description":"自定义分支","name":"Branch","type":"StringParameterDefinition"},{"_class":"hudson.model.BooleanParameterDefinition","defaultParameterValue":{"_class":"hudson.model.BooleanParameterValue","name":"release","value":false},"description":"是否生成生产release包","name":"release","type":"BooleanParameterDefinition"}]`
    }
    ajax({
        url,
        type: "POST",
        data,
        dataType: "json"
    }).then(d => {
        typeof cb === 'function' && cb(d);
    }, error=>{
        alert('部署失败');
    }).catch(d=>{
        alert("部署失败");
    })
}