const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./mysql.js")
const connection = con.con;

const {
    setUrlToken
} = require('../extension/sql/sql-func');

router.use(cookieParser());

function md5hex(str){
    const md5 = crypto.createHash("md5")
    return md5.update(str, "binary").digest("hex")
}

function createUuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
        let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


const server_path = 'http://localhost:5300/'

router.get('/', (req, res)=>{
    res.render('create_url',{});
})

router.post("/", async function(req, res,next) {

    try {
        if(req.body.create == "create"){
            const tokencook = createUuid();
            const isSet = await setUrlToken(server_path + "admin/register_user/" + tokencook);
            if (isSet === false) {
                return Error400Body(res, 'url is not set')
            }

            console.log("created url-token!!");
            res.redirect("/admin/url_token");
        }
    
        if(req.body.next == "next"){
            res.redirect("/admin/url_token");
        }
    
        if(req.body.list=="list"){
            res.redirect("/admin/list_users")
        }
    } catch (error) {
        console.log(error)
        return Error400Body(res, err)
    }
});



module.exports = router;
