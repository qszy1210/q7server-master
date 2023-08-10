const gitUrlMap = {
    web: 'front-theory',
    trek: 'front-goserver'
}

async function getMergeRequestDefaultTargetBranch() {
    const url = 'http://rd.q7link.com:8000/api/verify/latest-release/list'
    const {data} = await ajax({
        url,
        type: "GET",
        dataType: "json"
    })

    // 仅查找需要发布trek，web，h5的版本
    const activeRelease = data.find(item => item.apps.match(/trek|web|h5/))

    return activeRelease ? activeRelease.branch : ''
}

function initMergeRequestDefaultValue() {
    zget('merge_request_from_branch').then(v => {
        if (v) {
            $('#j_merge_from_branch').val(v);
        }
    })

    zget('merge_request_target_branch').then(v => {
        if (v) {
            $('#j_merge_target_branch').val(v);
        } else {
            // 没有记录值的情况下，去获取最新release的branch
            return getMergeRequestDefaultTargetBranch()
        }
    }).then(r => {
        if (r) {
            $('#j_merge_target_branch').val(r);
        }
    })
}

function handleOpenMergeRequest(project, source, target) {
    if (project in gitUrlMap) {
        chrome.tabs.create({url: `http://gitlab.q7link.com/front/${gitUrlMap[project]}/merge_requests/new?merge_request%5Bsource_branch%5D=${source}&merge_request%5Btarget_branch%5D=${target}`});
    }
}

async function handleMergeRequest() {
    const webMR = $('#j_merge_web').is(':checked')
    const trekMR = $('#j_merge_trek').is(':checked')
    if (!webMR && !trekMR) {
        return
    }
    const sourceBranch = $('#j_merge_from_branch').val()
    const targetBranch = $('#j_merge_target_branch').val()
    if (!sourceBranch && !targetBranch) {
        return
    }

    if (webMR) {
        handleOpenMergeRequest('web', sourceBranch, targetBranch)
    }
    if (trekMR) {
        handleOpenMergeRequest('trek', sourceBranch, targetBranch)
    }
    zset('merge_request_from_branch', sourceBranch)
    zset('merge_request_target_branch', targetBranch)
}
