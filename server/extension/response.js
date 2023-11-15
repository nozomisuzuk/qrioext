exports.Error400Body = function (res, message) {
    res.status(400).json({ code: 400, error: message })
}

exports.ErrorTokenBody = function (res) {
    res.status(401).json({ code: 401, error: 'Invalid Token' })
}

exports.Error404Body = function (res, message) {
    res.status(404).json({ code: 404, error: `Not Found ${message}` })
}