import express from 'express'
const router = express.Router()
import { getUserById } from '../models/users.js'
import {
  getCoupon,
  getCouponWithQS,
  getCouponById,
  countWithQS,
  updateUserCoupon,
} from '../models/coupon.js'
import authenticate from '../middlewares/jwt.js'
import { executeQuery } from '../models/base.js'
import pool from '../config/db.js'

// router.get('/', async (req, res) => {
//   const sql = `SELECT * FROM user_order_list`
//   const { rows } = await executeQuery(sql)
//   const data = rows

//   return res.json({ message: '成功讀取', data })
// })

router.post('/', async (req, res) => {
  const userId = req.body.userId // 从请求体中获取 userId
  if (userId === undefined) {
    return res.status(400).json({ error: '缺少 userId 数据' })
  }

  console.log(userId)

  const sql = `SELECT * FROM user_order WHERE user_id = ${userId}`
  const { rows } = await executeQuery(sql)

  const data = rows
  console.log(data)
  return res.json({ message: '成功讀取', data })
})

// router.post('/:orderId', async (req, res) => {
//   const orderId = req.body.orderId // 从请求体中获取 userId
//   if (orderId === undefined) {
//     return res.status(400).json({ error: '缺少 userId 数据' })
//   }

//   console.log(orderId)

// const sql = `SELECT user_order.order_id, coupon.*
//   FROM user_coupon
//   JOIN coupon ON user_coupon.coupon_id = coupon.id
//   WHERE user_coupon.user_id = ${req.user.id} AND coupon.is_valid = 1 AND user_coupon.status = 1 `

//   const sql = `SELECT * FROM user_order WHERE user_id = ${orderId}`
//   const { rows } = await executeQuery(sql)

//   const data = rows
//   return res.json({ message: '成功讀取', data })
// })

export default router
