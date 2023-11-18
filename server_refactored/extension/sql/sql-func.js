const mysql = require('mysql2')
const config = require('../../config/database.config')
const { beginTransaction, rollback, commit, query } = require('./sql-promise');


function createUuid(){
    return 'xxxxx-xyyyxxx-4xxx-yxxxyy-xxxxxxxxxx'.replace(/[xy]/g, function(a) {
            let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
     });
}


function PasswordExpirationDateFormatter(expiration_minutes) {
    const now = new Date();
    //const thirtyDaysLater = new Date(now.getTime() + (30 * 86400000));
    const tenMinutesLater = new Date(now.getTime() + (expiration_minutes * 60000));
    const formattedDate = tenMinutesLater.getFullYear() + '-' +
                        String(tenMinutesLater.getMonth() + 1).padStart(2, '0') + '-' +
                        String(tenMinutesLater.getDate()).padStart(2, '0') + ' ' +
                        String(tenMinutesLater.getHours()).padStart(2, '0') + ':' +
                        String(tenMinutesLater.getMinutes()).padStart(2, '0') + ':' +
                        String(tenMinutesLater.getSeconds()).padStart(2, '0');

    return formattedDate;
}

function TokenExpirationDateFormatter() {
    const now = new Date();
    //const thirtyDaysLater = new Date(now.getTime() + (30 * 86400000));
    const tenMinutesLater = new Date(now.getTime() + (30 * 86400000));
    const formattedDate = tenMinutesLater.getFullYear() + '-' +
                        String(tenMinutesLater.getMonth() + 1).padStart(2, '0') + '-' +
                        String(tenMinutesLater.getDate()).padStart(2, '0') + ' ' +
                        String(tenMinutesLater.getHours()).padStart(2, '0') + ':' +
                        String(tenMinutesLater.getMinutes()).padStart(2, '0') + ':' +
                        String(tenMinutesLater.getSeconds()).padStart(2, '0');

    return formattedDate;
}


function isCurrentDateBeforeExpiration(expirationDate) {
    const mysqlDate = new Date(expirationDate);
    const currentDate = new Date();

    return currentDate < mysqlDate;
}

/**
 * queryWrapper
 * @param queryText query文
 * @param params パラメーター
 * @returns {Promise<unknown  | undefined>} 指定queryの返り値
 */
async function queryWrapper(queryText, params = []) {
    const connection = mysql.createConnection(config.connect)
    try {
        await beginTransaction(connection)
        const data = await query(connection, queryText, params)
        await commit(connection)
        return data
    } catch (err) {
        await rollback(connection, err)
        console.log(err)
        return null
    } finally {
        connection.end()
    }
}

// user,4桁のパスを入力して、insertをする、返り値はないのでbooleanで返す

/**
 *
 * @param {string} name
 * @param {string} password
 * @returns {Promise<boolean>}
 */
exports.createUser = async function (name, password, expiration_minutes) {
    try {
        
        const expiration_date = PasswordExpirationDateFormatter(expiration_minutes);
        const queryText = 'INSERT INTO password_auth (username, password, expiration_date) VALUES (?, ?, ?)'

        await queryWrapper(queryText, [name, password, expiration_date])

        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

/**
 * @typedef {Object} UserInfo
 * @property {string} username ユーザーの名前
 * @property {string} token ユーザーのアイコンURL
 */


/**
 * @param {string} password
 * @returns {Promise<UserInfo> | undefined}
 */

exports.activateUser = async function (password) {
    try {
        const queryText = 'SELECT * FROM password_auth WHERE password = ? AND status = 1  AND expiration_date > NOW()'
        const data = await queryWrapper(queryText, [password])
        if (data.length === 0) {
            return null
        }

        if (data.length > 1) {
            console.log('data.length > 1')
            return null
        }

        //ここでusersにtokenを生成
        const tokenExpirationDate = TokenExpirationDateFormatter();
        const insertQueryText = 'INSERT INTO users (username, token, expiration_date) VALUES (?, ?, ?)'
        const token = createUuid()
        const insertData = await queryWrapper(insertQueryText, [data[0].username, token, tokenExpirationDate])
        const userInfo = {
            username: data[0].username,
            token: token
        }

        return userInfo
    } catch {
        return null
    }
}


//一度パス使ったらフラグを折るようにする
/**
 * @param {string} password
 * @returns {Promise<boolean>}
 */
exports.disablePassword = async function (password) {
    try {
        const queryText = 'UPDATE password_auth SET status = 0 WHERE password = ?'
        result = await queryWrapper(queryText, [password])

        const rowsAffected = result ? result.affectedRows : 0;
        return rowsAffected > 0;
    } catch {
        console.log(err)
        return false
    }
}

/**
 * @param {string} password
 * @returns {Promise<boolean>}
 */
exports.checkUsablePassword = async function (password) {
    try {
        const queryText = 'SELECT * From password_auth WHERE password = ? AND status = 1'
        result = await queryWrapper(queryText, [password])

        return result.length === 0;
    } catch {
        return false
    }
}

/**
 * @typedef {Object} User
 * @property {number} user_id ユーザーのID
 * @property {string} username ユーザーの名前
 * @property {string} token ユーザーのtoken
 * @property {number} status ユーザーが有効かどうか 0 or 1
 * @property {string} expiration_date ユーザーの有効期限
 */

/**
 * @returns {Promise<Array<User>> | undefined}
 */

exports.getAllUsers = async function () {
    try {
        const queryText = 'select * from users order by status DESC, id DESC'
        const data = await queryWrapper(queryText)
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}

/**
 * @param {string} password
 * @returns {Promise<boolean>}
 */
exports.deleteUser = async function (id) {
    try {
        const queryText = 'update users set status=0 where id = ?'
        result = await queryWrapper(queryText, [id])
        const rowsAffected = result ? result.affectedRows : 0;
        return rowsAffected > 0;
    } catch {
        return false
    }
}

/**
 * @param {string} password
 * @returns {Promise<boolean>}
 */
exports.restoreUser = async function (id) {
    try {
        const queryText = 'update users set status=1 where id = ?'
        result = await queryWrapper(queryText, [id])
        const rowsAffected = result ? result.affectedRows : 0;
        return rowsAffected > 0;
    } catch {
        return false
    }
}

