/**
 * 处理界面的一些文件会都到这里
 */

function setDeployStatus(statusObj, $span) {
    const {keyenv, status, targetjob} = statusObj;
    // const text = keyenv + status + targetjob;
    const tj = JSON.parse(targetjob);
    let tjStr = '';
    if (tj.length) {
        tjStr = tj.join(",")
    }
    $span.text(tjStr + ":" + status);
}