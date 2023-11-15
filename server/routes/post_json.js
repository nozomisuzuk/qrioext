const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
const mysql = require("mysql");
const con = require("./mysql.js")
const connection = con.con;

router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true}));

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


router.post("/", (req, res)=>{
	if(req.body.name){
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
	}else{
		res.json({
			"state":"error"
		});
	}
});



module.exports = router;
