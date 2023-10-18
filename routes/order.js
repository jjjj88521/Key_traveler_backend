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

router.post('/user_order', async (req, res) => {
  const userId = req.body.userId // 從請求體中獲取 userId
  if (userId === undefined) {
    return res.status(400).json({ error: '缺少 userId 數據' })
  }

  console.log(userId)

  const sql = `SELECT * FROM user_order WHERE user_id = ${userId}`
  const { rows } = await executeQuery(sql)

  const data = rows
  console.log(data)
  return res.json({ message: '成功讀取', data: data })
})

router.post('/group_order', async (req, res) => {
  const userId = req.body.userId // 從請求體中獲取 userId
  if (userId === undefined) {
    return res.status(400).json({ error: '缺少 userId 數據' })
  }

  console.log(userId)

  const sql = `SELECT * FROM group_order WHERE user_id = ${userId}`
  const { rows } = await executeQuery(sql)

  const data = rows
  console.log(data)
  return res.json({ message: '成功讀取', data: data })
})

router.post('/rent_order', async (req, res) => {
  const userId = req.body.userId // 從請求體中獲取 userId
  if (userId === undefined) {
    return res.status(400).json({ error: '缺少 userId 數據' })
  }

  console.log(userId)

  const sql = `SELECT id, user_id, order_date, status FROM rent_order WHERE user_id = ${userId}`
  const { rows } = await executeQuery(sql)

  const data = rows
  console.log(data)
  return res.json({ message: '成功讀取', data: data })
})

router.get('/purchase/:orderId', async (req, res) => {
  console.log(req)
  const orderId = req.params.orderId
  if (orderId === undefined) {
    return res.status(400).json({ error: '缺少 userId 數據' })
  }

  console.log(orderId)

  const sql = `
  SELECT
  uol.amount, uol.spec,
  p.id AS product_id,
  p.brand,
  p.name,
  p.price,
  p.images
  FROM
  user_order_list AS uol
  JOIN
  product AS p ON uol.product_id = p.id
  WHERE
  uol.order_id = "${orderId}"`

  // const sql = `
  // SELECT * FROM user_order_list WHERE order_id = "${orderId}"`
  const { rows } = await executeQuery(sql)
  const orderDetails = rows
  console.log(rows)
  return res.json({ message: '成功讀取', orderDetails })
})

router.get('/group/:orderId', async (req, res) => {
  console.log(req)
  const orderId = req.params.orderId
  if (orderId === undefined) {
    return res.status(400).json({ error: '缺少 userId 數據' })
  }

  console.log(orderId)

  const sql = `
  SELECT
  gol.amount, gol.spec,
  gb.id AS product_id,
  gb.brand,
  gb.name,
  gb.price,
  gb.images
  FROM
  group_order_list AS gol
  JOIN
  group_buy AS gb ON gol.product_id = gb.id
  WHERE
  gol.order_id = "${orderId}"`

  const { rows } = await executeQuery(sql)
  const orderDetails = rows
  console.log(rows)
  return res.json({ message: '成功讀取', orderDetails })
})

router.get('/rent/:orderId', async (req, res) => {
  console.log(req)
  const orderId = req.params.orderId
  if (orderId === undefined) {
    return res.status(400).json({ error: '缺少 userId 數據' })
  }

  console.log(orderId)

  const sql = `
  SELECT
  ro.start, ro.end, ro.rental_days, ro.spec,
  r.id AS rent_id,
  r.brand,
  r.name,
  r.price,
  r.images
  FROM
  rent_order AS ro
  JOIN
  rent AS r ON ro.rent_id = r.id
  WHERE
  ro.id = "${orderId}"`

  const { rows } = await executeQuery(sql)
  const orderDetails = rows
  console.log(rows)
  return res.json({ message: '成功讀取', orderDetails })
})
export default router
