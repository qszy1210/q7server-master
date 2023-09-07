function getNumber(str) {
    const ret = /\d+/.exec(str);
    if (ret) {
        return ret[0];
    }
    return null;
}

//chrome storage 中设置数据
function zset(key,value) {
  return new Promise((rel, rej)=>{
    chrome.storage.local.set({[key]: value}, function() {
      console.log('Value is set to ' + value);
      rel(value)
    });
  })
}
//chrome storage 中获取数据
function zget(key) {
  return new Promise((rel, rej)=>{
      chrome.storage.local.get({[key]: ""}, function(result){
        rel(result[key])
      })
  })
}

// jquery ajax with  promise
function ajax(options) {

    return zget('token').then(token=>{
      if (token) {
        options.headers = Object.assign({}, options.headers, {
          Token: token
        })
      }
    }).then(d=>{
      return new Promise(function (resolve, reject) {
        $.ajax(options).done(resolve).fail(reject);
      }).catch(error =>{
        console.error(error)
      });
    })

}


//请求ajax的时候, 默认带上 token
function ajaxWithToken(options) {
  return getToken().then(token=>{
      return ajax({
          ...options,
          headers:{
              token
          }
      })
  })
}


const openArr = [
  "BizReason/form/edit/8B89ER50QFU1001/rank_walk_key_1677066901483?contextOrgIds=K4WUXS50JUD0011&rangeWalkOptionsKey=ROUTERPARAMS_1867919df73.dbd",
  "BizReason/list",
  "AllocatedResultTarget/list",
  "PurReceipt/form/create?billTypeId=SUC8TV51UBH0001",
  "PurReceipt/list",
  "AdjustedCost/form/create?billTypeId=J652U1615TS0003",
  "AdjustedCost/list",
]


function openUrl(url) {
  chrome.tabs.create({ url });
}