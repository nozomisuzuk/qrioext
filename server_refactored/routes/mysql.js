const mysql = require("mysql");

const con = mysql.createConnection({
    host:"127.0.0.1",
    user:"keyserver",
    password:"23Y04M20D",
    database:"workspace",
    port: '3306',
    multipleStatements: true,
    charset: 'UTF8mb4',
})
con.connect(function(err){
    if(err) throw err;
    console.log("Connected");
});

module.exports= con;
