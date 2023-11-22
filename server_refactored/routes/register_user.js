const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
const mysql = require("mysql");
const con = require("./mysql.js")
const connection = con.con;
const server_path = 'http://localhost:5300/'
//const server_path = 'http://192.168.2.98:3000'

router.use(cookieParser());

function createUuid(){

    return 'xxxxx-xyyyxxx-4xxx-yxxxyy-xxxxxxxxxx'.replace(/[xy]/g, function(a) {
            let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
     });

}

function includeJa(str) {
    str = (str==null)?"":str;
    if(str.match(/^$/)){
      return false;
    }else{
      return true;
    }
}



router.get('/:id?', (req, res)=>{
    console.log(req.params.id);
    const sqll = "select * from Url_token where url = ? and status =1";
    con.query(sqll,[server_path + "admin/register_user/"+req.params.id],function(err, results){
        if(err){
            console.log('err:' + err);
            res.render('err',{})
        }
        else if(results == 0){
            console.log("record err");
            res.render('err',{})
        }
        else{
            console.log(results)
            res.render('register_user',{
                coments: "全角文字、特殊文字も使用可能です。"
            })
        }
    })
})

router.post("/:id?", (req, res)=>{
    


    if(req.body.register == "register"){
        con.query("select * from Url_token where url = ? and status =1"
                ,[server_path + "admin/register_user/"+req.params.id],function(err, results){


            if(err){
                console.log('err:' + err);
                res.render('err',{})
            }
            else if(results == 0){
                console.log("record err");
                res.render('err',{})
            }
            else{
                if(includeJa(req.body.username)){
                    //get tokens
                    const username = req.body.username;
                    console.log(username)
                    res.cookie("User", username,
                    {
                        expires:new Date(Date.now()+(86400000)*365),
                        httpOnly:false
                    });
        
                    const tokencook = createUuid();
                    console.log("token",tokencook)
                    res.cookie("Token", tokencook,
                    {
                        expires:new Date(Date.now()+(86400000)*365),
                        httpOnly:false
                    });
        
                    //keep token in mysql
                    con.query("insert into users set ?",{
                        username:username,
                        token:tokencook
                    })
        
                    //update status = 0
                    con.query( "update Url_token set status =0 where url = ?",
                        [ server_path + "admin/register_user/" + req.params.id],function(err,results){
                        if(err)console.log('err:' + err);
                        //go to key server
                        res.redirect('/key_server');
                        console.log("urlToken disabled.")
                    })
                }else if(!includeJa(req.body.username)){
                    console.log("one more")
                    res.render('register_user',{
                        coments: "もう一度入力してください。"
                    })
                }
            }
        })
    }


    if(req.body.name){
	    con.query("select * from Url_token where url = ? and status =1"
		    ,[server_path + "admin/register_user/"+req.params.id],function(err, results){
			    if(err){
				    console.log('err:' + err);
				    res.json({
		                      	"state":"error"
		              	    });
		            }
		            else if(results == 0){
               			    console.log("record err");
               			    res.json({
                       			"state":"error:this url is already used."
           			    });
          		    }
		            else{
				const username = req.body.name;
				const token = createUuid();
            

				con.query("insert into users set ?",{
                     			username:username,
                       			token:token
               		        });
                		res.json({
      	                		"name":username,
               	        		"token":token
              			});
			        //update status = 0
				con.query( "update Url_token set status =0 where url = ?",
				     [server_path + "admin/register_user/" + req.params.id],function(err,results){
				            if(err)console.log('err:' + err);
				             console.log("urlToken disabled.")
			        });
			    }
				                    
    		});
    }

});



module.exports = router;
