const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./mysql.js")
const connection = con.con;

router.use(cookieParser());

function md5hex(str){
    const md5 = crypto.createHash("md5")
    return md5.update(str, "binary").digest("hex")
}

const PASSWORD = md5hex("qrioext");
const server_path = 'http://localhost:5300/'

router.get('/', (req, res)=>{
    res.render('create_url',{});
})

router.post("/", (req, res,next)=>{
    
    function createUuid(){

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
                let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
         });

      }
  
    if(req.body.create == "create"){
        console.log("created url-token!!");
        const tokencook = createUuid();
        con.query("insert into Url_token set ?",{
            url:server_path + "admin/register_user/" + tokencook,
        })
        res.redirect("/admin/url_token");
    }

    if(req.body.next == "next"){
        res.redirect("/admin/url_token");
    }

    if(req.body.list=="list"){
        res.redirect("/admin/list_users")
    }
});



module.exports = router;
