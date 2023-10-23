import express from 'express'
const router = express.Router()
import { executeQuery, count } from '../models/base.js'
import authenticate from '../middlewares/jwt.js'
import pool from '../config/db.js'
import { addComment } from '../models/user_comment.js'

router.post('/addComment', async (req, res, next) => {
  try {
    // const user = req.user
    // const user_id = user.id
    const { order_id, product_id, star, user_id, comment, style } = req.body
    const result = await addComment(product_id, user_id, star, comment, style)

    const updateOrderSql = `UPDATE user_order_list
                            SET is_comment = 'true'
                            WHERE order_id = '${order_id}' AND product_id = '${product_id}'`

    const { rows: updateResult } = await executeQuery(updateOrderSql)
    console.log(updateResult)
    const newComment = {
      product_id,
      user_id,
      star,
      comment,
      style,
    }
    console.log(result)

    if (result.length !== 0 && updateResult.affectedRows === 1) {
      return res.json({ message: '新增成功', code: '200', newComment })
    } else {
      return res.status(400).json({ message: '新增失敗', code: '400' })
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: '新增失敗', code: '400' })
  }
})

// router.get('/comment', async (req, res) => {
//   const userId = req.body.userId // 從請求體中獲取 userId
//   if (userId === undefined) {
//     return res.status(400).json({ error: '缺少 userId 數據' })
//   }

//   console.log(userId)

//   const sql = `SELECT * FROM comment WHERE user_id = ${userId}`
//   const { rows } = await executeQuery(sql)

//   const data = rows
//   console.log(data)
//   return res.json({ message: '成功讀取', data: data })
// })

router.get('/yet_comment', authenticate, async (req, res) => {
  const userId = req.user.id // 從請求體中獲取 userId
  const { page } = req.query
  console.log(req)
  // if (userId === undefined) {
  //   return res.status(400).json({ error: '缺少 userId 數據' })
  // }
  console.log(userId)
  const sql = `SELECT uo.id AS order_id, p.id, p.name, p.brand, p.images, uol.is_comment, uol.spec, uol.order_id
  FROM user_order AS uo
  JOIN user_order_list AS uol ON uo.id = uol.order_id
  JOIN product AS p ON uol.product_id = p.id
  WHERE uo.user_id = ${userId} AND uol.is_comment = 'false'
  LIMIT 5 OFFSET ${page * 5 - 5 || 0}`

  const sqlTotal = `SELECT COUNT(uol.id) AS total
  FROM user_order AS uo
  JOIN user_order_list AS uol ON uo.id = uol.order_id
  JOIN product AS p ON uol.product_id = p.id
  WHERE uo.user_id = ${userId} AND uol.is_comment = 'false'`

  const { rows: rowsTotal } = await executeQuery(sqlTotal)
  const total = rowsTotal[0].total
  console.log(total)

  const { rows } = await executeQuery(sql)

  const data = rows
  // const total = data.length
  console.log(data)
  return res.json({ message: '成功讀取', total, page: page || 1, data: data })
})

// 取得會員的所有評價
router.get('/all-comments', authenticate, async (req, res, next) => {
  const user_id = req.user.id
  const { page } = req.query
  const sql = `SELECT c.*, p.name AS product_name, p.category_1 AS p_cate1, p.category_2 AS p_cate2,
              CASE 
                WHEN c.style = '' THEN '["單一規格"]'
                ELSE c.style 
              END AS style
              FROM comment c
              JOIN product p ON c.product_id = p.id
              WHERE c.user_id = ${user_id}
              LIMIT 5 OFFSET ${page * 5 - 5 || 0}`
  const total = await count('comment', { user_id })

  const { rows: comments } = await executeQuery(sql)

  res.json({ total, page: page || 1, comments })
})

export default router
