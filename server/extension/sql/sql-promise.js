//接続のpromise化
const beginTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) {
                console.log("接続失敗",err.message)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

//query実行のpromise化
const query = (connection, statement, params) => {
    return new Promise((resolve, reject) => {
        connection.query(statement, params, (err, results, fields) => {
            if (err) {
                reject(err)
            } else {
                resolve(results, fields)
            }
        })
    })
}

//commitのpromise化、commitしないと反映されない
const commit = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            if (err) {
                reject(err)
            } else {
                resolve(err)
            }
        })
    })
}

//エラーキャッチのためのrollback
const rollback = (connection, err) => {
    return new Promise((resolve, reject) => {
        connection.rollback(() => {
            reject(err)
        })
    })
}

module.exports = {
    beginTransaction: beginTransaction,
    query: query,
    commit: commit,
    rollback: rollback,
}
