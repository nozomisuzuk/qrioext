const express = require('express');
const http = require("http");
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const con = require("./routes/mysql.js")
const connection = con.con;
require('date-utils')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 8080;

//各種ルーター
const create_url = require('./routes/create_url');
const url_token = require('./routes/url_token');
const register_user = require('./routes/register_user');
const list_users = require('./routes/list_users');
const post_json = require('./routes/post_json');
const admin_temp = require('./routes/admin_temp');

var CLIENTS=[]; // クライアントのリスト
var User_cookie;
var Token_cookie;
var WS_User = 0;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//create url-token page

//print url-token page
app.use('/url_token',url_token);
//register and give usr-token (status =0)
app.use('/register_user',register_user);
//list
app.use('/list_users',list_users);

app.use('/post_json', post_json);



//indexページからとべるようにするところ
app.use('/admin_temp', admin_temp);
app.use('/list_users',list_users);
app.use('/CreateUrl',create_url);


app.set("view engine","ejs");

server.listen(PORT, () => {
    console.log(`${new Date()} サーバ起動 http://localhost:${PORT}`)
});

function date(){
    dt = new Date();
    formatted = dt.toFormat("YYYY/MM/DD HH24:MI:SS")

    return formatted
}

//鍵開錠用のページ
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
            console.log(date() + "unkown user login - ")
            res.render('err',{})
        }
        else if(results == 0){
            console.log(date() + "record err - ");
            res.render("key_server",{
                Name: "unkown"
            });
        }
        else{
            res.render("key_server",{
                Name: Name
            });
	//	res.render("maintenance",{});
        }
    })
});


// //websocket server
wss.on('connection', function(ws, req) {
    console.log(date() + " - " + ws._socket.remoteAddress);
    //console.log(decodeURIComponent(req.headers.cookie));
    ws.on('error', console.log);   
    if(ws._socket.remoteAddress == "192.168.2.97"){
	WS_User = "esp32";
	ws.id = WS_User;
	CLIENTS.push(ws);
	ws.send("websocket_connext");
	console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
    }else{
        if(!req.headers.cookie){
            ws.send("Bye");
            ws.close();
        }else{
        const cookie_name = decodeURIComponent(req.headers.cookie)+"; avoid=err; avoid=err;";
	User_cookie = cookie_name.split("; ")[0].replace(";","").split("=")[1];
	Token_cookie = cookie_name.split("; ")[1].replace(";","").split("=")[1];
        con.query("select * from users where username =? and token =? and status =1",
		[User_cookie, Token_cookie],
                    function(err, results){
                    if(err){
                        console.log('err:' + err);
                        res.render('err',{})
                    }
                    else if(results == 0){
			User_cookie = cookie_name.split("; ")[1].replace(";","").split("=")[1];
			Token_cookie = cookie_name.split("; ")[0].replace(";","").split("=")[1];
                        con.query("select * from users where username =? and token =? and status =1",
			[User_cookie, Token_cookie],
                        function(err, results){
                            if(err){
                                console.log('err:' + err);
                                res.render('err',{})
                            }
                            else if(results == 0){
                                ws.send("Bye")
                                console.log("token err" + date())
                                ws.close()
                            }
			    else{
				WS_User = User_cookie;
				ws.id = WS_User;
				    CLIENTS.push(ws);
				    ws.send("websocket_connect");
				    console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
			    }	
                        })
                    }
		    else{
			WS_User = User_cookie;
			ws.id = WS_User;
			CLIENTS.push(ws);
			ws.send("websocket_connect");
			console.log(date() + ' - 新しいクライアント::' + ws.id + " len=" + CLIENTS.length);
		    }
         })}
    }

   // ws.id = WS_User;
    //wss.clients.forEach(function each(client) {
      //  console.log('Client.ID: ' + client.id);
    //});
    //console.log(date() + '- 新しいクライアント： ' + ws.id);
    //CLIENTS.push(ws); //クライアントを登録
    //ws.send("websocket_connect");
    //console.log(CLIENTS.length)
    //ws.id = 0;

    ws.on('message', function(message) {
        //console.log('received: %s', message + "   - " + date());
        //ws.send("self message : " + message);  // 自分自身にメッセージを返す
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
});
