const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./mysql.js")
const connection = con.con;
const {
    getAllUsers,
    deleteUser,
    restoreUser
} = require('../extension/sql/sql-func');
const { Error400Body } = require('../extension/response.js');

router.use(cookieParser());

function md5hex(str){
    const md5 = crypto.createHash("md5")
    return md5.update(str, "binary").digest("hex")
}

const PASSWORD = md5hex("qrioext");

router.get('/', (req, res)=>{
    res.render('administor',{
        coments: "パスワードを入力してください。"
    })
})

router.post('/', async function(req, res, next) {
    if(req.body.submit == "submit"){
        const password = md5hex(req.body.password);
        if( password == PASSWORD){
            try {
                const users = await getAllUsers()
                res.render("list_users",{
                    users: users
                });
            } catch (err) {
                console.log(err)
            }

        }else{
            res.render('administor',{
                coments: "パスワードが違います。"
            })
        }
    }
})

router.get("/delete/:id?",async function(req, res, next){
    try {
        const isDeleted = await deleteUser(req.params.id);
        if (isDeleted === false) {
            return Error400Body(res, 'user is not deleted')
        }

        const users = await getAllUsers();
        res.render("list_users",{
            users: users
        });
    } catch (err) {
        return Error400Body(res, err)
    }
})

router.get("/restore/:id?",async function(req, res, next){
    try {
        const isDeleted = await restoreUser(req.params.id);
        if (isDeleted === false) {
            return Error400Body(res, 'user is not restored')
        }

        const users = await getAllUsers();
        res.render("list_users",{
            users: users
        });
    } catch (err) {
        return Error400Body(res, err)
    }
})

module.exports = router;