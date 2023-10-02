import express from 'express'
const router = express.Router()

import { findOne, insertOne, count } from '../models/base.js'

import jsonwebtoken from 'jsonwebtoken'
// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

router.post('/jwt', async function (req, res, next) {
  //get providerData
  const providerData = req.body

  console.log(JSON.stringify(providerData))

  // 檢查從react來的資料
  if (!providerData.providerId || !providerData.uid) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 以下流程:
  // 1. 先查詢資料庫是否有同google_uid的資料
  // 2-1. 有存在 -> 執行登入工作
  // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

  const isFound = await count('users', { google_uid: providerData.uid })

  if (isFound) {
    // 有存在 -> 執行登入工作
    const user = await findOne('users', { google_uid: providerData.uid })

    // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
    delete user.password

    // 產生存取令牌(access token)，其中包含會員資料
    const accessToken = jsonwebtoken.sign({ ...user }, accessTokenSecret, {
      expiresIn: '24h',
    })

    // 使用httpOnly cookie來讓瀏覽器端儲存access token
    res.cookie('accessToken', accessToken, { httpOnly: true })

    // 傳送access token回應(react可以儲存在state中使用)
    // 傳送access token回應(react可以儲存在state中使用)
    return res.json({
      message: 'success',
      code: '200',
      accessToken,
    })
  } else {
    // 3. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作
    const newUser = {
      name: providerData.displayName,
      email: providerData.email,
      google_uid: providerData.uid,
      photo_url: providerData.photoURL,
    }

    await insertOne('users', newUser)

    const user = await findOne('users', { google_uid: providerData.uid })

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
})

router.post('/session', async function (req, res, next) {
  //get providerData
  const providerData = req.body

  console.log(JSON.stringify(providerData))

  // 檢查從react來的資料
  if (!providerData.providerId || !providerData.uid) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 以下流程:
  // 1. 先查詢資料庫是否有同google_uid的資料
  // 2-1. 有存在 -> 執行登入工作
  // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

  const isFound = await count('users', { google_uid: providerData.uid })

  if (isFound) {
    // 有存在 -> 執行登入工作

    const user = await findOne('users', { google_uid: providerData.uid })

    // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
    delete user.password

    // 啟用session(這裡是用session cookie機制)
    req.session.userId = user.id

    return res.json({ message: 'success', code: '200', user })
  } else {
    // 3. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作
    const newUser = {
      name: providerData.displayName,
      email: providerData.email,
      google_uid: providerData.uid,
      photo_url: providerData.photoURL,
    }

    await insertOne('users', newUser)

    const user = await findOne('users', { google_uid: providerData.uid })

    // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
    delete user.password

    // 啟用session(這裡是用session cookie機制)
    req.session.userId = user.id

    return res.json({ message: 'success', code: '200', user })
  }
})

export default router
