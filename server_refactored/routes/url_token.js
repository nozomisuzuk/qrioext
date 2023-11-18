const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const con = require(".//mysql.js")
const connection = con.con;

router.get('/', (req, res)=>{
    const sqll = "select * from Url_token where id=(select MAX(id) from Url_token where status=1)";
    con.query(sqll,function(err, results){
        if(err){
            console.log('err:' + err);
        }else if(results == 0){
            res.render('err')            
        }else{
            console.log(results)
            res.render('url_token',{
                Url_token : results
            })
        }
    })
})

router.post("/", (req, res,next)=>{

});



module.exports = router;
