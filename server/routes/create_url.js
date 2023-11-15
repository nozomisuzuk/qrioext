const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const mysql = require("mysql");
const con = require(".//mysql.js")
const connection = con.con;

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

router.post("/", (req, res,next)=>{
    if(req.body.submit == "submit"){
        const password = md5hex(req.body.password);
        if( password == PASSWORD){
            res.render('create_url',{});

        }else{
            res.render('administor',{
                coments: "パスワードが違います。"
            })
        }
    }

    function createUuid(){

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
                let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
         });

      }
  
    if(req.body.create == "create"){
        console.log("created url-token!!");
        const tokencook = createUuid();
        const sqll = "insert into Url_token set ?";
        console.log("okyokeyOkey?")
        con.query(sqll,{
            url:"http://192.168.2.98:3000/register_user/" + tokencook,
        })
        res.redirect("/url_token");
    }
    if(req.body.next == "next"){
        res.redirect("/url_token");
    }
    if(req.body.next == "list"){
        res.redirect("/list_users");
    }
});



module.exports = router;
