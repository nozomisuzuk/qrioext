const mysql = require("mysql");

const con = mysql.createConnection({
    host:"localhost",
    user:"keyserver",
    password:"23Y04M20D",
    database:"workspace"
})
con.connect(function(err){
    if(err) throw err;
    console.log("Connected");
});

module.exports= con;
