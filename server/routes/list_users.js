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
 
router.get('/', (req, res)=>{
        res.render('administor',{
            coments: "パスワードを入力してください。"
        })
})
 
router.post('/', (req, res)=>{
    if(req.body.submit == "submit"){
        const password = md5hex(req.body.password);
        if( password == PASSWORD){
            con.query("select * from users order by status DE    SC, id DESC",(err,results)=>{
                res.render("list_users",{
                    users: results
                });
            })
 
        }else{
            res.render('administor',{
                coments: "パスワードが違います。"
            })
        }
    }
 
    function createUuid(){
 
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace    (/[xy]/g, function(a) {
                let r = (new Date().getTime() + Math.random()     * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
         });
 
      }
})
 
router.get("/delete/:id?",(req, res)=>{
    con.query("update users set status=0 where id = ?",[req.p    arams.id],(err,result)=>{
        if(err) throw err;
        con.query("select * from users order by status DESC,     id DESC",(err,results)=>{
            if(err) throw err;
            res.render("list_users",{
                users: results
            });
        })
    })
})
