# README
### デバックの方法
curlとwscatでそれぞれアクセスする
- 正常系のデバックはHeaderにデバック用Cookieを追加する
  - "state-check"を"do"に変更することでUnlockが可能
  -  デバック用　User: qrio_debug, Token: 6bb94-eab899e-463e-930789-3b48c13620;
- 異常系のデバックは不適なCookieを使用する
  - normal_debug.shのコメントアウトに記載
