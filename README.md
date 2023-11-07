# Qrio Extension
サーバー経由でQrio keyを電気的にスイッチングして開錠する
### 正常系の図
![0526正常系](https://github.com/morita761/QrioExtAndroidTV/assets/112071745/66c1473f-733e-4b96-9509-608f4483847b)

### 異常系の図（認証エラー）
![0526異常系](https://github.com/morita761/QrioExtAndroidTV/assets/112071745/30e6fd79-8224-4ba6-be22-c44581c2967e)
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
192.168.2.98:3030/post_jsonにuser名をpostすることで，新しいtokenがjsonファイルでpostされる
これは廃止予定。
```
[postリクエスト]
curl http://192.168.2.98:3030/post_json -d "name=${username}"
```
```
[返答例]
{"name":${username},"token":"1c***-e8b8***-4dbf-***eab-db671d***f"}
```
