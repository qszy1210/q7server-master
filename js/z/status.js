

// 2023-05-18
// 根据服务器获取所有的进行中的状态
function fetchDeployStatus2(env, callback) {
    const url = `http://ops.q7link.com:8080/api/qqdeploy/oneclickdeploy/?page=1&limit=20&targetEnv=${env}`
    ajax({
        type: "GET",
        dataType: "json",
        url
    }).then(data=>{
        const records = data && data.data && data.data.record && data.data.record;
        // const web = record.filter(item=>item.targetjob.indexOf('web')>-1 || item.targetjob.indexOf('trek')>-1);
        // const apps = record.filter(item=>item.targetjob.indexOf('apps')>-1);
        const runningRecords = records.filter(i=>i.status==='running');

        typeof callback === 'function' && callback(runningRecords)
    })
}

function fetchDeployBranch(env) {
    const url = `http://ops.q7link.com:8080/api/qqdeploy/oneclicktemplate/?templateenv=${env}`
    return ajax({
        type: "GET",
        dataType: "json",
        url
    }).then(data=>{
        const info = data && data.data;

        const items = info["front-static"];
        const item = items.find(i=>(i&&i.defaultParameterValue && i.defaultParameterValue.name) === "Branch");

        return item.defaultParameterValue.value;

    })
}