function getNumber(str) {
    const ret = /\d+/.exec(str);
    if (ret) {
        return ret[0];
    }
    return null;
}

//chrome storage 中设置数据
function cset(key,value) {
  return new Promise((rel, rej)=>{
    chrome.storage.local.set({[key]: value}, function() {
      console.log('Value is set to ' + value);
      rel(value)
    });
  })
}
//chrome storage 中获取数据
function cget(key) {
  return new Promise((rel, rej)=>{
      chrome.storage.local.get({[key]: ""}, function(result){
        rel(result[key])
      })
  })
}

// jquery ajax with  promise
function ajax(options) {
    return new Promise(function (resolve, reject) {
      $.ajax(options).done(resolve).fail(reject);
    }).catch(error =>{
      console.error(error)
    });
  }

