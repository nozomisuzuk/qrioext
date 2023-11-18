const express = require('express')
const { Error400Body } = require('../extension/response')
const {
    createUser, 
    activateUser,
    disablePassword,
    checkUsablePassword
} = require('../extension/sql/sql-func')
const { md5hex } = require('../extension/sql/crypto')
const router = express.Router()



router.get('/', function(req, res, next) {
    res.render('create_user');
});



//admin側(webアプリ用)
router.post('/create', async function (req, res, next) {    
    try {
        const name = req.body.name
        const password = req.body.password
        const expirationMinutes = req.body.expiration

        const isUsable = await checkUsablePassword(md5hex(password))
        if (isUsable === false) {
            return Error400Body(res, 'password is already used')
        }

        const isCreated = await createUser(name, md5hex(password), expirationMinutes)
        if (isCreated === false) {
            return Error400Body(res, 'user is not created')
        }
        res.redirect('/admin/create_user');
        //return res.json({ name: name, password: password })
    } catch (e) {
        return Error400Body(res, e)
    }
})

router.post('/activate', async function (req, res, next) {
    try {
        const password = req.body.password
        const userInfo = await activateUser(md5hex(password))
        console.log(userInfo)
        if (userInfo === null) {
            return Error400Body(res, 'user is not found')
        }
        const isDisabled = await disablePassword(md5hex(password))
        if (isDisabled === false) {
            return Error400Body(res, 'user is not disabled')
        }

        //return res.json({name: userInfo.username, token: userInfo.token})
        res.redirect('/admin/create_user');
    } catch (e) {
        console.log(e)
        return Error400Body(res, e)
    }
})







// //admin側から叩くapi
// router.post('/create', async function (req, res, next) {    
//     try {
//         const name = req.body.name
//         const password = req.body.password
//         const isUsable = await checkUsablePassword(md5hex(password))
//         if (isUsable === false) {
//             return Error400Body(res, 'password is already used')
//         }

//         const isCreated = await createUser(name, md5hex(password))
//         if (isCreated === false) {
//             return Error400Body(res, 'user is not created')
//         }
//         return res.json({ name: name, password: password })
//     } catch (e) {
//         return Error400Body(res, e)
//     }
// })

// router.post('/activate', async function (req, res, next) {
//     try {
//         const password = req.body.password
//         const userInfo = await activateUser(md5hex(password))
//         if (userInfo === null) {
//             return Error400Body(res, 'user is not found')
//         }
//         const isDisabled = await disableUser(md5hex(password))
//         if (isDisabled === false) {
//             return Error400Body(res, 'user is not disabled')
//         }

//         return res.json({name: userInfo.name, token: userInfo.token})

//     } catch (e) {
//         return Error400Body(res, e)
//     }

// })


module.exports = router