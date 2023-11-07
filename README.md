# Qrio Extension
サーバー経由でQrio keyを電気的にスイッチングして開錠する
### 正常系の図
![20231107正常系](https://github.com/bmcomp0/QrioExt/assets/112071745/47cf86fb-a237-4fbc-8ed1-322114ee3f7d)

### 異常系の図（認証エラー）
![20231107異常系](https://github.com/bmcomp0/QrioExt/assets/112071745/d66984c8-95d2-4447-9e3e-4af9e29dbcc0)
## 0. [環境構築](./ENVIRONMENT.md)
## 1. [操作方法](./OPERATING.md)
## 2. 構成
### - routes
   - expressのrouteメソット
   - JavaScript ファイル
### - views
   - デザインページ
   - ejsファイル
### - server.js
   - Qrio Ext. を起動するjsファイル
## 3. WebSocketの送受信Message
clientから送信するMessageと，正常系のserverからの返信の一覧
| 送信 | 返答 |
| ---- | ---- |
| do | message:esp32:unlock |
| off | message:esp32:close |
| state-check | message:esp32ok |
## 4. jsonによってtokenをpostする
192.168.2.98:3030/post_jsonにuser名をpostすることで，新しいtokenがjsonファイルでpostされる。
これは廃止予定。
```
[postリクエスト]
curl http://192.168.2.98:3030/post_json -d "name=${username}"
```
```
[返答例]
{"name":${username},"token":"1c***-e8b8***-4dbf-***eab-db671d***f"}
```
