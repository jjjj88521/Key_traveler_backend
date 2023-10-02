import express from 'express'
const router = express.Router()

import jsonwebtoken from 'jsonwebtoken'

import authenticate from '../middlewares/jwt.js'

import { verifyUser, getUser } from '../models/users.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

router.get('/private', authenticate, (req, res) => {
  const user = req.user

  return res.json({ message: 'authorized', user })
})

// 檢查登入狀態用
router.get('/check-login', authenticate, async (req, res) => {
  const user = req.user
  return res.json({ message: 'authorized', user })
})

router.post('/login', async (req, res) => {
  console.log(req.body)
  // 從要求的req.body獲取username與password
  const { username, password } = req.body

  // 先查詢資料庫是否有同username/password的資料
  const isMember = await verifyUser({
    username,
    password,
  })

  console.log(isMember)

  if (!isMember) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 會員存在，將會員的資料取出
  const member = await getUser({
    username,
    password,
  })

  console.log(member)

  // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
  delete member.password

  // 產生存取令牌(access token)，其中包含會員資料
  const accessToken = jsonwebtoken.sign({ ...member }, accessTokenSecret, {
    expiresIn: '24h',
  })

  // 使用httpOnly cookie來讓瀏覽器端儲存access token
  res.cookie('accessToken', accessToken, { httpOnly: true })

  // 傳送access token回應(react可以儲存在state中使用)
  res.json({
    message: 'success',
    code: '200',
    accessToken,
  })
})

router.post('/logout', authenticate, (req, res) => {
  // 清除cookie
  res.clearCookie('accessToken', { httpOnly: true })

  res.json({ message: 'success', code: '200' })
})

router.post('/logout-ssl-proxy', authenticate, (req, res) => {
  // 清除cookie
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  })

  res.json({ message: 'success', code: '200' })
})

export default router
