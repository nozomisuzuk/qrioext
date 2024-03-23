# 環境構築　
### 0.前提環境
- OS : Ubuntu20.04LST Desktop
- OS : Ubuntu22.10LST Desktop

[](3000番のポートを開放しているのにserver.js内では3030番を指定している)
### 1.前提パッケージのインストール
```bash
$ sudo apt update && sudo apt upgrade -y
$ sudo apt install npm
$ sudo apt install node
$ sudo apt install nginx
$ sudo apt install mysql-server
$ sudo ufw enable
$ sudo ufw allow http && sudo ufw allow 3000 
```

### 2.プログラムのインストール
```bash
#Personal access tokenを利用してのcloneを推奨
$ git clone https://github.com/bmcomp0/QrioExt.git
$ cd QrioExt/server_refactored
#node.jsのパッケージのインストール
$ npm ci
```

### 3.mysqlの設定
```sql
$ sudo mysql
CREATE USER 'keyserver'@"localhost" IDENTIFIED BY 'password';
GRANT ALL ON *.* TO "keyserver"@"localhost"; 
ALTER USER 'keyserver'@'localhost' IDENTIFIED WITH mysql_native_password BY '23Y04M20D';
create database workspace;
use workspace;
create table users(id int auto_increment, username text not null, token text not null, status int default 1, expiration_date datetime not null, primary key(id));
create table Url_token(id int auto_increment, url text not null, status int default 1, primary key(id));
create table password_auth(id int auto_increment, username text not null, password text not null, status int default 1, expiration_date datetime not null, primary key(id));
```

### 4.mysql タイムアウト設定
- /ect/mysql/my.cnf
```:/ect/mysql/my.cnf
[mysqld]
wait_timeout = 31536000
interactive_timeout = 31536000
```
#### 設定の確認
```bash
$ sudo mysql
show global variables like"%timeout%";
```
以下のようになっていれば正常に反映されている
```
wait_timeout = 31536000
interactive_timeout = 31536000
```
[](作業ディレクトリを~/QrioKeyServerとしてるのにWorkingDirectoryで別の場所を指定しているので、作業ディレクトリを~/QrioExtとする)
### 5.serverの自動起動設定（systemd）
想定ユーザー,グループ名はubuntu
- /etc/systemd/system/bmc_lock.service
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

```bash
$ systemctl enable bmc_lock.service
$ systemctl start bmc_lock.service
```
#### 終了方法
```bash
$ systemctl stop bmc_lock.service
```
#### 自動起動の無効化
```bash
$ systemctl disable bmc_lock.service
```


