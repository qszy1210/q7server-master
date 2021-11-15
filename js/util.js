function getNumber(str) {
    const ret = /\d+/.exec(str);
    if (ret) {
        return ret[0];
    }
    return null;
}