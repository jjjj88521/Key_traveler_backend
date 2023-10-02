# express-base-es6-esm

## !!使用前注意

- `.env`檔已移除，記得clone後，將`.env.template`改為`.env`檔案
- `.env`中`DB_設定`需改為你的資料庫、帳號、密碼才能開始使用
- 資料庫schema檔案在`data`中

## TODO

- [ ] change db & sql style and format to [SQL Style Guide](https://www.sqlstyle.guide/zh-tw/)
- [ ] line login
- [ ] google(firebase) login
- [ ] category db
- [ ] favorite db?
- [ ] comment db?
- [ ] order db(order_item, shipping, payment)

## FIXME

## Changlog

- OTP workflow
- +nodemailer + Google SMTP
- +[faker](https://github.com/faker-js/faker)
- fixed create table issue(executeQuery only one query each time) drop if exist then create
- es6 import wo babel 
- auth route (session-cookie should use?... no, use jwt)

### 20230604

- get: all, byId is ok
- post: insertOne is ok

### 20230606

- json2db(create db and insert data) ok
- db backup tool ok
- create, drop, TRUNCATE db.... should need another TEST db?
