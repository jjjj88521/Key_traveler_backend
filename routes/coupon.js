import express from 'express'
const router = express.Router()
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

// 讀取該會員優惠券
router.get('/', authenticate, async (req, res) => {
  updateUserCoupon(req.user.id)
  // const sql = `SELECT user_coupon.coupon_id, coupon.*
  // FROM user_coupon
  // JOIN coupon ON user_coupon.coupon_id = coupon.id
  // WHERE user_coupon.user_id = ${req.user.id} AND coupon.is_valid = 1 AND coupon.start_date > NOW()`
  const sql = `SELECT user_coupon.coupon_id, coupon.*
  FROM user_coupon
  JOIN coupon ON user_coupon.coupon_id = coupon.id
  WHERE user_coupon.user_id = ${req.user.id} AND coupon.is_valid = 1 AND user_coupon.status = 1 `
  const { rows } = await executeQuery(sql)
  const coupon = rows.map((v) => ({
    couponId: v.id,
    coupon_code: v.coupon_code,
    coupon_name: v.coupon_name,
    description: v.description,
    threshold: v.threshold,
    discount_percent: v.discount_percent,
    discount_value: v.discount_value,
    start_date: v.start_date,
    end_date: v.end_date,
  }))
  return res.json({ message: 'authorized', coupon })
})

// 讀取已過期
router.get('/couponExpired', authenticate, async (req, res) => {
  const sql = `SELECT user_coupon.coupon_id, coupon.*
  FROM user_coupon
  JOIN coupon ON user_coupon.coupon_id = coupon.id
  WHERE user_coupon.user_id = ${req.user.id} AND coupon.is_valid = 1 AND user_coupon.status = 0`
  const { rows } = await executeQuery(sql)
  const couponExpired = rows.map((v) => ({
    couponId: v.id,
    coupon_code: v.coupon_code,
    coupon_name: v.coupon_name,
    description: v.description,
    threshold: v.threshold,
    discount_percent: v.discount_percent,
    discount_value: v.discount_value,
    end_date: v.end_date,
  }))
  return res.json({ message: 'authorized', couponExpired })
})

// 讀取已使用
router.get('/couponUsed', authenticate, async (req, res) => {
  const sql = `SELECT user_coupon.coupon_id, coupon.*
  FROM user_coupon
  JOIN coupon ON user_coupon.coupon_id = coupon.id
  WHERE user_coupon.user_id = ${req.user.id} AND coupon.is_valid = 1 AND user_coupon.status = 2`
  const { rows } = await executeQuery(sql)
  const couponUsed = rows.map((v) => ({
    couponId: v.id,
    coupon_code: v.coupon_code,
    coupon_name: v.coupon_name,
    description: v.description,
    threshold: v.threshold,
    discount_percent: v.discount_percent,
    discount_value: v.discount_value,
    end_date: v.end_date,
  }))
  return res.json({ message: 'authorized', couponUsed })
})

// 新增優惠碼
router.post('/', async (req, res) => {
  // 從要求的req.body獲取couponCode
  const { couponCode, userId } = req.body
  if (couponCode == '') {
    return res.json({ message: 'fail', code: '401' })
  }
  // 先查詢資料庫是否有同couponCode的資料
  const findCouponId = `SELECT id FROM coupon WHERE coupon_code = '${couponCode}'`
  const [result, fields] = await pool.execute(findCouponId)
  if (!result.length) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 查詢該優惠碼是否過期
  const findIsExpiredCoupon = `SELECT end_date FROM coupon WHERE coupon_code = '${couponCode}'`
  const [result2, fields2] = await pool.execute(findIsExpiredCoupon)
  if (result2[0].end_date < new Date().toISOString().split('T')[0]) {
    return res.json({ message: 'fail', code: '403' })
  }

  // 查詢該優惠碼是否已經輸入過
  const findDuplicateCoupon = `SELECT id FROM user_coupon WHERE coupon_id = ${result[0].id}`
  const [result1, fields1] = await pool.execute(findDuplicateCoupon)
  if (result1.length) {
    return res.json({ message: 'fail', code: '402' })
  }

  // 新增該優惠碼的id到user_coupon
  const updateUserCoupon = `INSERT INTO user_coupon (user_id, coupon_id, status)
  SELECT u.id,${result[0].id} , 1
  FROM users u
  WHERE u.id = ${userId}`
  await pool.execute(updateUserCoupon)
  return res.json({ message: 'success', code: '200' })
})

export default router
