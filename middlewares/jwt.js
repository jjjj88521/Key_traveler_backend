import jsonwebtoken from 'jsonwebtoken'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 獲得加密用字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 中介軟體middleware，用於檢查是否在認証情況下
export default function authenticate(req, res, next) {
  //const token = req.headers['authorization']
  const token = req.cookies.accessToken
  console.log(token)

  // if no token
  if (!token) {
    return res.json({ message: 'Forbidden', code: '403' })
  }

  if (token) {
    // verify的callback會帶有decoded payload(解密後的有效資料)就是user的資料
    jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.json({ message: 'Forbidden', code: '403' })
      }

      // 將user資料加到req中
      req.user = user
      next()
    })
  } else {
    return res.json({ message: 'Unauthorized', code: '401' })
  }
}
