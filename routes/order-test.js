import express from 'express'
const router = express.Router()

import authenticate from '../middlewares/jwt.js'
import { executeQuery } from '../models/base.js'
import pool from '../config/db.js'

// 新增一般商品訂單
router.post('/addProductOrder', authenticate, async (req, res) => {
  // 建立user_order & user_order_list

  // user_order
  const firstsql = `SELECT MAX(CAST(SUBSTR(id, 2) AS SIGNED)) + 1 AS next_id FROM user_order;`
  const { rows } = await executeQuery(firstsql)
  const newPId =
    rows[0].next_id < 10
      ? 'P00' + rows[0].next_id
      : rows[0].next_id >= 10 && rows[0].next_id < 100
      ? 'P0' + rows[0].next_id
      : 'P' + rows[0].next_id
  const firstsql1 = `INSERT INTO user_order (id, user_id,order_date,status) VALUES ('${newPId}', ${req.user.id},'${req.body.date}','${req.body.status}');`
  await pool.execute(firstsql1)

  // user_order_list
  // 建立user_order_list資料
  let secondsql1 = ''
  // 刪除購物車已建立的商品
  let secondsql2 = ''
  for (const v of req.body.data) {
    const specData = JSON.stringify(v.specData)
    secondsql1 = `INSERT INTO user_order_list ( order_id,product_id,amount,spec,is_comment) VALUES ('${newPId}',${v.id} ,${v.quantity},'${specData}','false');`
    secondsql2 = `DELETE FROM cart WHERE user_id = ${req.user.id} AND product_id = ${v.id} AND spec = '${specData}';`
    await pool.execute(secondsql1)
    await pool.execute(secondsql2)
  }

  // 將用過的優惠券user_coupon.status=2
  if (req.body.couponId != 0) {
    const lastsql = `UPDATE user_coupon SET status = 2 WHERE user_id  = ${req.user.id} AND coupon_id = ${req.body.couponId}`
    // console.log(lastsql)
    await pool.execute(lastsql)
  }
  return res.json({ message: 'success', code: '200' })
})

// 新增團購商品訂單
router.post('/addGroupOrder', authenticate, async (req, res) => {
  // 建立group_order & group_order_list

  // group_order
  const firstsql = `SELECT MAX(CAST(SUBSTR(id, 2) AS SIGNED)) + 1 AS next_id FROM group_order;`
  const { rows } = await executeQuery(firstsql)
  const newPId =
    rows[0].next_id < 10
      ? 'G00' + rows[0].next_id
      : rows[0].next_id >= 10 && rows[0].next_id < 100
      ? 'G0' + rows[0].next_id
      : 'G' + rows[0].next_id
  const firstsql1 = `INSERT INTO group_order (id, user_id,order_date,status) VALUES ('${newPId}', ${req.user.id},'${req.body.date}','${req.body.status}');`
  await pool.execute(firstsql1)

  // group_order_list
  // 建立 group_order_list
  let secondsql1 = ''
  // 刪除購物車已建立的商品
  let secondsql2 = ''
  // 更新團購人數
  let secondsql3 = ''
  for (const v of req.body.data) {
    const specData = JSON.stringify(v.specData)
    secondsql1 = `INSERT INTO group_order_list ( order_id,product_id,amount,spec) VALUES ('${newPId}',${v.id} ,${v.quantity},'${specData}');`
    secondsql2 = `DELETE FROM cart_group WHERE user_id = ${req.user.id} AND groupbuy_id = ${v.id} AND spec = '${specData}';`
    secondsql3 = `UPDATE group_buy SET current_people = current_people + 1 WHERE id  = ${v.id}`
    await pool.execute(secondsql1)
    await pool.execute(secondsql2)
    await pool.execute(secondsql3)
  }

  return res.json({ message: 'success', code: '200' })
})

// 新增租用商品訂單
router.post('/addRentOrder', authenticate, async (req, res) => {
  // 建立rent_order
  const firstsql = `SELECT MAX(CAST(SUBSTR(id, 2) AS SIGNED)) + 1 AS next_id FROM rent_order;`
  const { rows } = await executeQuery(firstsql)
  console.log(rows[0].next_id)
  const newPId =
    rows[0].next_id < 10
      ? 'R00' + rows[0].next_id
      : rows[0].next_id >= 10 && rows[0].next_id < 100
      ? 'R0' + rows[0].next_id
      : 'R' + rows[0].next_id
  let secondsql1 = ''
  // 刪除購物車已建立的商品
  let secondsql2 = ''
  for (const v of req.body.data) {
    const specData = JSON.stringify(v.specData)

    // 將日期字串解析為日期對象
    const startDate = new Date(v.startDate)
    const endDate = new Date(v.endDate)
    // 計算日期差
    const timeDiff = endDate - startDate
    // 將時間差轉換為天數
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1

    secondsql1 = `INSERT INTO rent_order (id, user_id,order_date,status,rent_id,start,end,rental_days,spec) VALUES ('${newPId}', ${req.user.id},'${req.body.date}','${req.body.status}',${v.id},'${v.startDate}','${v.endDate}',${dayDiff},'${specData}');`
    // secondsql2 = `DELETE FROM cart_rent WHERE user_id = ${req.user.id} AND rent_id = ${v.id} AND spec = '${specData}';`
    await pool.execute(secondsql1)
    // await pool.execute(secondsql2)
  }
  secondsql2 = `DELETE FROM cart_rent WHERE is_checked = 1;`
  await pool.execute(secondsql2)

  return res.json({ message: 'success', code: '200' })
})

router.get('/getOrderListPd', authenticate, async (req, res) => {
  const firstsql = `SELECT MAX(CAST(SUBSTR(id, 2) AS SIGNED)) AS now_id FROM user_order;`
  const { rows } = await executeQuery(firstsql)
  const newPId =
    rows[0].now_id < 10
      ? 'P00' + rows[0].now_id
      : rows[0].now_id >= 10 && rows[0].now_id < 100
      ? 'P0' + rows[0].now_id
      : 'P' + rows[0].now_id
  console.log(rows)
  console.log(newPId)
  return res.json({ message: 'success', code: '200', orderPId: newPId })
})

router.get('/getOrderListGb', authenticate, async (req, res) => {
  const firstsql = `SELECT MAX(CAST(SUBSTR(id, 2) AS SIGNED)) AS now_id FROM group_order;`
  const { rows } = await executeQuery(firstsql)
  const newGId =
    rows[0].now_id < 10
      ? 'G00' + rows[0].now_id
      : rows[0].now_id >= 10 && rows[0].now_id < 100
      ? 'G0' + rows[0].now_id
      : 'G' + rows[0].now_id
  console.log(firstsql)
  return res.json({ message: 'success', code: '200', orderGId: newGId })
})

router.get('/getOrderListR', authenticate, async (req, res) => {
  const firstsql = `SELECT MAX(CAST(SUBSTR(id, 2) AS SIGNED)) AS now_id FROM rent_order;`
  const { rows } = await executeQuery(firstsql)
  const newRId =
    rows[0].now_id < 10
      ? 'R00' + rows[0].now_id
      : rows[0].now_id >= 10 && rows[0].now_id < 100
      ? 'R0' + rows[0].now_id
      : 'R' + rows[0].now_id
  console.log(firstsql)
  return res.json({ message: 'success', code: '200', orderRId: newRId })
})
export default router
