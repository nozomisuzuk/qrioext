const crypto = require('crypto')

/**
 * md5で暗号化する
 * @param {string} str
 * @returns {string}
 */
exports.md5hex = function (str /*: string */) {
    const md5 = crypto.createHash('md5')
    return md5.update(str, 'binary').digest('hex')
}
