# 操作方法
### 0.登録方法
- SSID:ssid15 にWiFi接続
- 送付された http://192.168.2.98:3000/register_user/$UUID を叩く
- 登録名を入力し，tokenをブラウザクッキーにて入手する

### 1.開錠のやり方
- ssid15に接続後、http://192.168.2.98:3000/key_server にアクセス
- Qrio Key is alive!!の表示を確認
- 円形の`Unlock`を押す
- Unlockメーセージの数秒後、解錠される

### 2.登録用リンクの作成方法
- ssid15に接続後、http://192.168.2.98:3000/CreateUrl
- password:qrioext
- `create`を押す
- URL（ http://192.168.2.98:3000/register_user/$UUID ）をコピーする

### 3.ユーザーの無効化
- ssid15に接続後、http://192.168.2.98:3000/list_users
- password:qrioext
- `削除`を押す
- statusが0になれば無効化
- `復元`を押すとstatusが1に戻る
