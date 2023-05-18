const express = require('express');
const http = require("http");
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./routes/mysql.js")
const connection = con.con;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

const create_url = require('./routes/create_url');
const url_token = require('./routes/url_token');
const register_user = require('./routes/register_user');

var CLIENTS=[]; // クライアントのリスト
var id;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//create url-token page
app.use('/CreateUrl',create_url);
//print url-token page
app.use('/url_token',url_token);
//register and give usr-token (status =0)
app.use('/register_user',register_user);

app.set("view engine","ejs");

server.listen(PORT, () => {
    console.log(`${new Date()} サーバ起動 http://localhost:${PORT}`)
});

app.get('/key_server', function(req, res) {
    if(req.cookies){
        Name = req.cookies.User;
        Token = req.cookies.Token;
    }else{
        Name = 0;
        Token = 0;
    }

    con.query("select * from users where username =? and token =? and status =1", [Name, Token], function(err, results){
        if(err){
            console.log("unkown user login")
            res.render('err',{})
        }
        else if(results == 0){
            console.log("record err");
            res.render("key_server",{
                Name: "unkown"
            });
        }
        else{
            res.render("key_server",{
                Name: Name
            });
        }
    })
});


// //websocket server
wss.on('connection', function(ws, req) {
    console.log(ws._socket.remoteAddress);
    console.log(decodeURIComponent(req.headers.cookie));
    if(ws._socket.remoteAddress != "::ffff:192.168.2.97"){
        if(!req.headers.cookie){
            ws.send("Bye")
            ws.close()
        }else{
        const cookie_name = decodeURIComponent(req.headers.cookie)+"; avoid=err; avoid=err;";
        con.query("select * from users where username =? and token =? and status =1",
                [cookie_name.split("; ")[0].replace(";","").split("=")[1], cookie_name.split("; ")[1].replace(";","").split("=")[1]], 
                    function(err, results){
                    if(err){
                        console.log('err:' + err);
                        res.render('err',{})
                    }
                    else if(results == 0){
                        con.query("select * from users where username =? and token =? and status =1",
                        [cookie_name.split("; ")[1].replace(";","").split("=")[1], cookie_name.split("; ")[0].replace(";","").split("=")[1]], 
                        function(err, results){
                            if(err){
                                console.log('err:' + err);
                                res.render('err',{})
                            }
                            else if(results == 0){
                                ws.send("Bye")
                                console.log("token err")
                                ws.close()
                            }
                        })
                    }
        })}
    }

    id = Math.floor(Math.random() * 999999999);
    console.log('新しいクライアント： ' + id);
    CLIENTS.push(ws); //クライアントを登録
    ws.send("websocket_connect");

    ws.on('message', function(message) {
        console.log('received: %s', message);
        ws.send("self message : " + message);  // 自分自身にメッセージを返す

        for (var j=0; j < CLIENTS.length; j++) {
          //他の接続しているクライアントにメッセージを一斉送信
            if(ws !== CLIENTS[j]) {CLIENTS[j].send("message:" + message);} 
        }
    });

    ws.on('close', function() {
        console.log('ユーザー：' + id + ' がブラウザを閉じました');
        delete CLIENTS[id];
    });
});
