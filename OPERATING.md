# 操作方法
### 0.登録方法
- SSID:ssid15 にWiFi接続
- 送付された http://192.168.2.98:3000/admin/register_user/$UUID を叩く
- 登録名を入力し，tokenをブラウザクッキーにて入手する

### 1.開錠のやり方
- ssid15に接続後、http://192.168.2.98:3000/key_server にアクセス
- Qrio Key is alive!!の表示を確認
- 円形の`Unlock`を押す
- Unlockメーセージの数秒後、解錠される

### 2.登録用リンクの作成方法（UrlToken作成）
- ssid15に接続後、http://192.168.2.98:3000/admin にアクセス
- password:qrioext
- `URLToken作成`を押す
- `create`を押す
- URL（ http://192.168.2.98:3000/admin/register_user/$UUID ）をコピーする

### 3.ユーザーの無効化
- ssid15に接続後、http://192.168.2.98:3000/admin
- password:qrioext
- `ユーザー一覧`を押す
- `Delete`を押す
- statusが0になれば無効化
- `Restore`を押すとstatusが1に戻り，復元

### 4.4桁の数字によるユーザー登録
- ssid15に接続後、http://192.168.2.98:3000/admin にアクセス
- Username, Password(4桁の数字), Expiration を入力し，`Create User`を押す
- 端末からhttp://192.168.2.98:3000/admin/create_user に4桁の数字をPOST
