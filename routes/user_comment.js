import express from 'express'
const router = express.Router()
import { executeQuery, count } from '../models/base.js'
import authenticate from '../middlewares/jwt.js'
import pool from '../config/db.js'
import { addComment } from '../models/user_comment.js'

// 讀取該會員評價
// router.get('/', authenticate, async (req, res) => {
//   console.log('coupon_test_authenticate')
//   const sql = `SELECT *
//   FROM user_comment
//   JOIN product ON user_comment.product_id = product.id
//   WHERE user_coupon.user_id = ${req.user.id} AND coupon.is_valid = 1 AND user_coupon.status = 1 `
//   const { rows } = await executeQuery(sql)
//   const coupon = rows.map((v) => ({
//     couponId: v.id,
//     coupon_code: v.coupon_code,
//     coupon_name: v.coupon_name,
//     description: v.description,
//     threshold: v.threshold,
//     discount_percent: v.discount_percent,
//     discount_value: v.discount_value,
//     end_date: v.end_date,
//   }))
//   // return res.json({ message: 'authorized', rows, user })
//   return res.json({ message: 'authorized', coupon })
// })

// 取得所有該商品的評論，並且加入分頁以及篩選星數功能
// router.get('/product/:pid', async (req, res, next) => {
//   const pid = req.params.pid
//   // 獲取網頁的搜尋字串
//   const { star, page, orderby, perpage } = req.query

//   // TODO: 這裡可以檢查各query string正確性或給預設值，檢查不足可能會產生查詢錯誤

//   // 建立資料庫搜尋條件
//   const conditions = []
//   conditions.push(pid ? `product_id = ${pid}` : '')
//   conditions.push(star ? `star = ${star}` : '')
//   //各條件為AND相接(不存在時不加入where從句中)
//   const conditionsValues = conditions.filter((v) => v)

//   // 各條件需要先包含在`()`中，因各自內查詢是OR, 與其它的是AND
//   const where =
//     conditionsValues.length > 0
//       ? `WHERE ` + conditionsValues.map((v) => `( ${v} )`).join(' AND ')
//       : ''

//   // 分頁用
//   // page預設為1，perpage預設為5
//   const perpageNow = Number(perpage) || 5
//   const pageNow = Number(page) || 1
//   const limit = perpageNow
//   // page=1 offset=0 ; page=2 offset= perpage * 1; ...
//   const offset = (pageNow - 1) * perpageNow

//   // 排序用，預設使用預設時間排序，新的在上面
//   const order = orderby
//     ? { [orderby.split(',')[0]]: orderby.split(',')[1] }
//     : { created_time: 'desc' }

//   // 查詢
//   // const total = await countWithQS({ product_id: pid })
//   const starTotal = await countWithQS(where)
//   // const avgStar = await getAvgStar(pid)
//   const products = await getCommentsWithQS(where, order, limit, offset)

//   // json回傳範例
//   //
//   // {
//   //   total: 100,
//   //   qsTotal: 100,
//   //   perpage: 10,
//   //   page: 1,
//   //   data:[
//   //     {id:123, name:'',...},
//   //     {id:123, name:'',...}
//   //   ]
//   // }

//   const result = {
//     star: Number(star) || 'all',
//     starTotal: starTotal,
//     perpage: Number(perpage) || 5,
//     page: Number(page) || 1,
//     data: products,
//   }

//   res.json(result)
// })

// 計算各個星數的評論數量及平均星數
// router.get('/product/:pid/count', async (req, res, next) => {
//   const pid = req.params.pid
//   const total = await countWithQS({ product_id: pid })

//   const avgStar = await getAvgStar(pid)

//   const eachStar = await countEachStar(pid)

//   const result = {
//     total: total,
//     avgStar: avgStar,
//     eachStar: eachStar,
//   }

//   res.json(result)
// })

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
  // if (userId === undefined) {
  //   return res.status(400).json({ error: '缺少 userId 數據' })
  // }

  console.log(userId)

  const sql = `SELECT uo.id AS order_id ,p.id, p.name, p.brand, p.images, uol.is_comment, uol.spec, uol.order_id
  FROM user_order AS uo
  JOIN user_order_list AS uol ON uo.id = uol.order_id
  JOIN product AS p ON uol.product_id = p.id
  WHERE uo.user_id = ${userId} AND uol.is_comment = false`

  const { rows } = await executeQuery(sql)

  const data = rows
  console.log(data)
  return res.json({ message: '成功讀取', data: data })
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
