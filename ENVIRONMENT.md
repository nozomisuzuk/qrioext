# 環境構築　
### 0.前提
- OS : Ubuntu20.04LST Desktop
- OS : Ubuntu22.10LST Desktop

### 1.必要なインストール
- $ sudo apt update
- $ sudo apt install npm
- $ sudo apt install node
- $ sudo apt install nginx
- $ sudo apt install mysql-server
- $ sudo ufw enable
- $ sudo ufw allow http | sudo ufw allow 3000 

### 2.npm (nodejsに必要なインストール)
- $ mkdir ~/QrioKeyServer | cd QrioKeyServer
- $ sudo npm init
- $ npm i express
- $ npm i ws
- $ npm i ejs
- $ npm i cookie-parser
- $ npm i crypto
- $ npm i mysql
- $ npm i date-utils

### 3.mysql settings
- $ sudo mysql
- CREATE USER 'keyserver'@"localhost" IDENTIFIED BY 'password';
- GRANT ALL ON *.* TO "keyserver"@"localhost"; 
- ALTER USER 'keyserver'@'localhost' IDENTIFIED WITH mysql_native_password BY '23Y04M20D';
- create database workspace;
- use workspace;
- create table users(id int auto_increment, username text not null, token text not null, status int default 1, expiration_date datetime not null, primary key(id));
- create table Url_token(id int auto_increment, url text not null, status int default 1, primary key(id));
- create table password_auth(id int auto_increment, username text not null, password text not null, status int default 1, expiration_date datetime not null, primary key(id));

### 4.mysql タイムアウト設定
- sudo vi /ect/mysql/my.cnf
- ```
  [mysqld]
  wait_timeout = 31536000
  interactive_timeout = 31536000
  ```
- :wq
#### 設定の確認
- sudo mysql
- show global variables like"%timeout%";

### 5.serverの自動起動設定（systemd）
- sudo vi /etc/systemd/system/bmc_lock.service
```
[Unit]
Description=Server operating qrio key
After=syslog.target network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/QrioExt/server_refactored
ExecStart=/usr/bin/node /home/ubuntu/QrioExt/server_refactored/server.js
StandardOutput=append:/home/ubuntu/QrioExt/server_refactored/log/access.log
StandardError=append:/home/ubuntu/QrioExt/server_refactored/log/error.log
KillMode=process
Restart=always

[Install]
WantedBy=multi-user.target
```
- systemctl enable bmc_lock.service
- systemctl start bmc_lock.service
#### 終了方法
- systemctl stop bmc_lock.service
