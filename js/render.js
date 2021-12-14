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