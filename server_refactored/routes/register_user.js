const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
const mysql = require("mysql");
const con = require("./mysql.js")
const connection = con.con;
//const server_path = 'http://localhost:5300/'
const server_path = 'http://192.168.2.98:3000/'


const { 
    checkUrlToken,
    createUserFromUrlToken,
    disableUrlToken
} = require('../extension/sql/sql-func');
const { Error400Body } = require('../extension/response.js');

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



router.get('/:id?', async function(req, res){
    try {
        const isUrlAvailable = await checkUrlToken(server_path + "admin/register_user/"+req.params.id);
        if (isUrlAvailable === false) {
            return Error400Body(res, 'url is not available')
        }
        res.render('register_user',{
            coments: "全角文字、特殊文字も使用可能です。"
        })
    } catch(err) {
        console.log(err)
        return Error400Body(res, err)
    }
})


router.post("/:id?", async function(req, res){
    if(req.body.register == "register"){
        try {
            const url = server_path + "admin/register_user/"+req.params.id
            const isUserAvailable = await checkUrlToken(url);
            if (isUserAvailable === false) {    
                return Error400Body(res, 'user is not available')   
            }

            //cookieに保存
            const username = req.body.username;
            if (!username) {
                res.render('register_user',{
                    coments: "もう一度入力してください。"
                })
                return;
            }
            const tokencook = createUuid();
            res.cookie("User", username,
            {
                expires:new Date(Date.now()+(86400000)*365),
                httpOnly:false
            });
            res.cookie("Token", tokencook,
            {
                expires:new Date(Date.now()+(86400000)*365),
                httpOnly:false
            });


            const isUserCreated = await createUserFromUrlToken(username, tokencook);
            if (isUserCreated === false) {
                return Error400Body(res, 'user is not created')
            }

            const isUrlTokenDisabled = await disableUrlToken(url);
            if (isUrlTokenDisabled === false) {
                return Error400Body(res, 'url token is not disabled')
            }

            res.redirect('/key_server');

        } catch(err) {
            return Error400Body(res, err)
        }
    }

    //AP1用
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
