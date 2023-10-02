import express from 'express'
const router = express.Router()
import jsonwebtoken from 'jsonwebtoken'

import { findOne, insertOne, count } from '../models/base.js'
// line-login模組
import line_login from '../services/line-login.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
// line 登入使用
const channel_id = process.env.LINE_CHANNEL_ID
const channel_secret = process.env.LINE_CHANNEL_SECRET
const callback_url = process.env.LINE_LOGIN_CALLBACK_URL

const LineLogin = new line_login({
  channel_id,
  channel_secret,
  // react line page callback url
  // 注意: LINE_LOGIN_CALLBACK_URL 是前端(react/next)路由
  // 必需要與 LINE developer 的 "Callback URL" 設定一致
  // 目前與LINE登入頁設定為一致(登入頁路由=回調頁路由)
  callback_url,
  scope: 'openid profile',
  prompt: 'consent',
  bot_prompt: 'normal',
})

// ------------ 以下為路由 ------------

// JWT登出機制
router.get('/logout', async function (req, res, next) {
  if (!req.query) {
    return res.json({ message: 'fail' })
  }
  // get access_token from db
  // 有存在 -> 執行登入工作
  const user = await findOne('users', {
    line_uid: req.query.line_uid,
  })

  const line_access_token = user.line_access_token

  // https://developers.line.biz/en/docs/line-login/managing-users/#logout
  // 登出時進行撤銷(revoke) access token
  LineLogin.revoke_access_token(line_access_token)

  // 清除cookie
  res.clearCookie('accessToken', { httpOnly: true })
  // 因登入過程中也用到session，也會產生 SESSION_ID，所以也要清除
  res.clearCookie('SESSION_ID', { httpOnly: true })

  return res.json({ message: 'success', code: '200' })
})

// 此api路由為產生登入網址，之後前端自己導向line網站進行登入
router.get('/login', LineLogin.authJson())

// 此api路由為line登入後，從前端(react/next)callback的對應路由頁面，即真正登入處理路由
// 目前只實作jwt
router.get(
  '/callback',
  LineLogin.callback(
    // 登入成功的回調函式 Success callback
    async (req, res, next, token_response) => {
      console.log(token_response)

      // 以下流程:
      // 1. 先查詢資料庫是否有同line_uid的資料
      // 2-1. 有存在 -> 執行登入工作
      // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有line來的資料 -> 執行登入工作
      const isFound = await count('users', {
        line_uid: token_response.id_token.sub,
      })

      if (isFound) {
        // 有存在 -> 執行登入工作
        const user = await findOne('users', {
          line_uid: token_response.id_token.sub,
        })

        // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
        delete user.password

        // 產生存取令牌(access token)，其中包含會員資料
        const accessToken = jsonwebtoken.sign({ ...user }, accessTokenSecret, {
          expiresIn: '24h',
        })

        // 使用httpOnly cookie來讓瀏覽器端儲存access token
        res.cookie('accessToken', accessToken, { httpOnly: true })

        // 傳送access token回應(react可以儲存在state中使用)
        return res.json({
          message: 'success',
          code: '200',
          accessToken,
        })
      } else {
        // 3. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有line來的資料 -> 執行登入工作
        const newUser = {
          name: token_response.id_token.name,
          email: '',
          line_uid: token_response.id_token.sub,
          line_access_token: token_response.access_token,
          photo_url: token_response.id_token.picture,
        }

        await insertOne('users', newUser)

        const user = await findOne('users', {
          line_uid: token_response.id_token.sub,
        })

        // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
        delete user.password

        // 產生存取令牌(access token)，其中包含會員資料
        const accessToken = jsonwebtoken.sign({ ...user }, accessTokenSecret, {
          expiresIn: '24h',
        })

        // 使用httpOnly cookie來讓瀏覽器端儲存access token
        res.cookie('accessToken', accessToken, { httpOnly: true })

        // 傳送access token回應(react可以儲存在state中使用)
        return res.json({
          message: 'success',
          code: '200',
          accessToken,
        })
      }
    },
    // 登入失敗的回調函式 Failure callback
    (req, res, next, error) => {
      console.log('line login fail')

      return res.json({ message: 'fail', error })
    }
  )
)

export default router
