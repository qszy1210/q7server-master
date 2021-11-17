function getNumber(str) {
    const ret = /\d+/.exec(str);
    if (ret) {
        return ret[0];
    }
    return null;
}

//chrome 中设置数据
// todo
function cset() {

}
//chrome 中获取数据
// todo
function cget() {

}

// jquery ajax with  promise
function ajax(options) {
    return new Promise(function (resolve, reject) {
      $.ajax(options).done(resolve).fail(reject);
    });
  }