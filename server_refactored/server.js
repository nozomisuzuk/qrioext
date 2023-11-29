const express = require('express');
const http = require("http");
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./routes/mysql.js")
const connection = con.con;
require('date-utils')

const {
    checkUser
} = require('./extension/sql/sql-func')
const { Error400Body } = require('./extension/response')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 5300;


//認証まわり
const session = require('express-session');
app.use(session({
    secret: 'qrioext', // セキュリティのための秘密鍵
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // クッキーの有効期限（例：1時間）
}));




//各種ルーター
const create_url = require('./routes/create_url');
const url_token = require('./routes/url_token');
const register_user = require('./routes/register_user');
const list_users = require('./routes/list_users');
const post_json = require('./routes/post_json');
const create_user = require('./routes/create_user');
const e = require('express');

var CLIENTS=[]; // クライアントのリスト
var Name;
var Token;
var User_cookie;
var Token_cookie;
var WS_User = 0;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/admin/url_token',url_token);
app.use('/admin/register_user',register_user);


app.set("view engine","ejs");

server.listen(PORT, () => {
    console.log(`${new Date()} サーバ起動 http://localhost:${PORT}`)
});

function date(){
    dt = new Date();
    formatted = dt.toFormat("YYYY/MM/DD HH24:MI:SS")

    return formatted
}








//管理者ページ
app.get('/admin/login', function(req, res) {
    res.render('admin_login'); // ログインページのテンプレートを表示
});

app.post('/admin/login', function(req, res) {
    const { password } = req.body;
    if (password === 'qrioext') { 
        req.session.authenticated = true;
        res.redirect('/admin');
    } else {
        res.render('admin_login', { error: 'Invalid password' });
    }
});

function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

app.use('/admin', requireAuth);


app.get('/admin', function(req, res) {
    res.render('admin_index',{})
});

app.use('/admin/create_user', create_user);
app.use('/admin/list_users',list_users);
app.use('/admin/CreateUrl',create_url);




//鍵開錠用のページ
app.get('/key_server', async function(req, res) {
    try {
        if(req.cookies){
            Name = req.cookies.User;
            Token = req.cookies.Token;
        }else{
            Name = 0;
            Token = 0;
        }

        console.log("Name:" + Name);
        console.log("Token:" + Token);
    
        const isAuth = await checkUser(Name, Token);
        if (isAuth === false) {
            res.render("key_server",{
                Name: "unknown"
            });
            return;
        }

        res.render("key_server",{
            Name: Name
        });
    } catch (e) {   
        return Error400Body(res, e)
    }
});


// //websocket server
wss.on('connection', async function(ws, req) {
    try {
        console.log(date() + " - " + ws._socket.remoteAddress);
        ws.on('error', console.log);   

        if(ws._socket.remoteAddress == "192.168.2.97"){
            WS_User = "esp32";
            ws.id = WS_User;
            CLIENTS.push(ws);
            ws.send("websocket_connext");
            console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
        } else {
            if(!req.headers.cookie){
                ws.send("Bye");
                ws.close();
            }else{
                const cookie_name = decodeURIComponent(req.headers.cookie);
                const cookies = cookie_name.trim().split(';');
                cookies.forEach((cookie) => {
                    const parts = cookie.split('=');

                    if (parts.length === 2) {
                        const name = parts[0].trim();
                        const value = parts[1].trim();

                        if (name === "User") {
                            User_cookie = value;
                        } else if (name === "Token") {
                            Token_cookie = value;
                        }
                    }
                });

                isAuth = await checkUser(User_cookie, Token_cookie);
                
                if (isAuth === false) { 
                    console.log(date() + " - terminate:" + ws.id);
                }

                WS_User = User_cookie;
                ws.id = WS_User;
                CLIENTS.push(ws);
                ws.send("websocket_connect");
                console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
            }
        }

        ws.on('message', function(message) {
            if(message == 'ping'){
                ws.send('pong');
                if(ws.id == "esp32"){
                    clearTimeout(this.pingTimeout);
                    this.pingTimeout = setTimeout(() => {
                        console.log(date() + " - terminate:" + ws.id);
                        ws.close();
                        CLIENTS = CLIENTS.filter(function (conn) {
                            return (conn == ws) ? false : true;
                        });
                    },30000 + 5000);
                } else {
                    clearTimeout(this.pingClientTimeout);
                    this.pingClientTimeout = setTimeout(() => {
                        console.log(date() + " - terminate:" + ws.id);
                        ws.close();
                    }, 1000 + 1000);
                }
            }else{
                console.log(date() + '- received: %s', message);
                    wss.clients.forEach(function (client) {
                    if(ws.readyState == 1){
                            client.send('message:'+message);
                    }
                    });
            }
        });


        ws.on('ping', function(){
            clearTimeout(this.pingClientTimeout);
                this.pingClientTimeout = setTimeout(() => {
                    console.log(date() + " - terminate ping pong:" + ws.id);
                    ws.close();
            }, 5000 + 1000);
        });

        //切断時
        ws.on('close', function () {
            CLIENTS = CLIENTS.filter(function (conn) {
            if(conn === ws){
                    console.log(date() + ' - ユーザー：' + conn.id + ' がブラウザを閉じました');
            }
            return (conn === ws) ? false : true;
            });
            console.log('connecting id:');
            wss.clients.forEach(function each(client) {
                console.log(client.id);
            });
        });
    } catch (err) {
        console.log(err)
        return Error400Body(res, err)
    }
});
