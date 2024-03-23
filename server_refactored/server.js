const express = require('express');
const http = require("http");
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./routes/mysql.js")
const connection = con.con;
require('date-utils')

const {
    checkUser,
    activateUser,
    disablePassword
} = require('./extension/sql/sql-func')
const { Error400Body } = require('./extension/response')
const { md5hex } = require('./extension/sql/crypto')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;


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
//const e = require('express');

var CLIENTS=[]; // クライアントのリスト

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


//4桁のパスワードの受け取り
app.post('/activate', async function (req, res, next) {
	if(req.body.password){
	    try {
            const password = req.body.password
            const userInfo = await activateUser(md5hex(password))
            console.log(userInfo)
            if (userInfo === null) {
                return Error400Body(res, 'user is not found')
			}
		    const isDisabled = await disablePassword(md5hex(password))
	        if (isDisabled === false) {
                return Error400Body(res, 'user is not disabled')
			}
            return res.json({name: userInfo.username, token: userInfo.token}) 
            //   res.redirect('/admin/create_user?message=User activated successfully');        
        } catch (e) {
            console.log(e)
            return Error400Body(res, e)		    
        }
	}
})

//鍵開錠用のページ
app.get('/key_server', async function(req, res) {
    try {
        var Name;
        var Token;
        if(req.cookies.User){
            Name = req.cookies.User;
            Token = req.cookies.Token;
        }else{
            Name = "null";
            Token = "null";
        }
    
        const isAuth = await checkUser(Name, Token);
        if (isAuth === false) {
            if(Name == "null"){
                res.render("key_server",{
                    Name: "No Token"
                });
                console.log(date() + " - ブラウザ版にトークンを所持していないユーザーがアクセスしました");
                return;
            }else{
                res.render("key_server",{
                    Name: "expired"
                });
                console.log(date() + " - ブラウザ版に期限切れのユーザー:" + Name+ "がアクセスしました");
                return;
            }
            
        }

        res.render("key_server",{
            Name: Name
        });
        console.log(date() + " - ブラウザ版に" + Name+ "がアクセスしました");
    } catch (e) {   
        return Error400Body(res, e)
    }
});


// //websocket server
wss.on('connection', async function(ws, req) {
    try {
        var User_cookie;
        var Token_cookie;
        console.log(date() + " - " + ws._socket.remoteAddress);
        ws.on('error', console.log);   

        if(ws._socket.remoteAddress == "192.168.2.97"){
            ws.id = "esp32";
            CLIENTS.push(ws);
            ws.send("websocket_connext");
            console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
        } else if(ws._socket.remoteAddress == "192.168.2.239"){
            ws.id = "esp32button1";
            CLIENTS.push(ws);
            ws.send("websocket_connext");
            console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
        }else {
            if(!req.headers.cookie){
                //cookieがないユーザーのwebsocketを切断
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
		console.log("Name:"+User_cookie+" - Token:" + Token_cookie);

                isAuth = await checkUser(User_cookie, Token_cookie);
                console.log(isAuth);
                //データベースに登録されていないユーザーのwebsocketを切断
                if (isAuth === false) { 
                    console.log(date() + " - 期限切れ,または未登録のアクセスをterminate:" + User_cookie);
		            ws.close();
                }

                ws.id = User_cookie;
                CLIENTS.push(ws);
                ws.send("websocket_connect");
                console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
                User_cookie = "null";
                Token_cookie = "null";
            }
        }

        ws.on('message', function(message) {
            if(message == 'ping'){
                ws.send('pong');
                if(ws.id == "esp32"){
                    clearTimeout(this.pingTimeout);
                    this.pingTimeout = setTimeout(() => {
                        console.log(date() + " - terminate by message ping-pong:" + ws.id);
                        ws.close();
                        CLIENTS = CLIENTS.filter(function (conn) {
                            return (conn == ws) ? false : true;
                        });
                    },30000 + 5000);
                } else {
                    clearTimeout(this.pingClientTimeout);
                    this.pingClientTimeout = setTimeout(() => {
                        console.log(date() + " - terminate by message ping-pong:" + ws.id);
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
                    console.log(date() + " - terminate by ping-pong:" + ws.id);
                    ws.close();
            }, 5000 + 1000);
        });

        //切断時
        ws.on('close', function () {
            CLIENTS = CLIENTS.filter(function (conn) {
            if(conn === ws){
                    console.log(date() + ' - ユーザー：' + conn.id + ' のwsが切断されました');
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
