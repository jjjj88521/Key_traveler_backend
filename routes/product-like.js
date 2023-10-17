import express from 'express'
const router = express.Router()

import { count, executeQuery, whereSql, orderbySql } from '../models/base.js'

import authenticate from '../middlewares/jwt.js'

// 獲得某會員id的有加入到我的最愛清單中的商品id們
router.get('/my-favorite', authenticate, async (req, res, next) => {
  const { cate } = req.query
  const sql = `SELECT pl.product_id
        FROM product_like AS pl
        WHERE pl.user_id = ${req.user.id} AND cate = '${cate}'
        ORDER BY pl.product_id ASC;`

  const { rows } = await executeQuery(sql)
  // 將結果中的pid取出變為一個純資料的陣列
  const favorites = rows.map((v) => v.product_id)

  res.json({ favorites })
})

router.get('/all-products-no-login', async (req, res, next) => {
  const sql = `SELECT p.*
    FROM product AS p
    ORDER BY p.id ASC`

  const { rows } = await executeQuery(sql)

  res.json({ products: rows })
})

router.get('/all-products', authenticate, async (req, res, next) => {
  const user = req.user
  const uid = user.id

  const sql = `SELECT p.id, IF(pl.id, 'true', 'false') AS is_favorite
    FROM product AS p
    LEFT JOIN product_like AS pl ON pl.product_id = p.id
    AND pl.user_id = ${uid}
    ORDER BY p.id ASC`

  const { rows } = await executeQuery(sql)

  console.log(rows)

  // cast boolean
  const products = rows.map((v) => ({
    ...v,
    is_favorite: v.is_favorite === 'true',
  }))

  console.log(products)

  res.json({ products })
})

router.get('/like-list', authenticate, async (req, res, next) => {
  // 獲取參數
  const { page, cate, orderby } = req.query
  const user = req.user
  const uid = user.id

  const whereClosure = cate
    ? whereSql({ 'pl.user_id': uid, 'pl.cate': cate })
    : whereSql({ 'pl.user_id': uid })

  const orderbyClosure = orderby
    ? orderbySql({ [orderby.split(',')[0]]: orderby.split(',')[1] })
    : orderbySql({ id: 'asc' })

  // 將三種商品的資料表都取出，或者根據帶入的 cate 篩選其中一種
  let sql = `
  SELECT 
    CASE
      WHEN pl.cate = 'pd' THEN pd.id
      WHEN pl.cate = 'gb' THEN gb.id
      WHEN pl.cate = 'rt' THEN rt.id
    END AS id,
    CASE
      WHEN pl.cate = 'pd' THEN pd.name
      WHEN pl.cate = 'gb' THEN gb.name
      WHEN pl.cate = 'rt' THEN rt.name
    END AS name,
    CASE
      WHEN pl.cate = 'pd' THEN pd.price
      WHEN pl.cate = 'gb' THEN gb.price
      WHEN pl.cate = 'rt' THEN rt.price
    END AS price,
    CASE
      WHEN pl.cate = 'pd' THEN pd.images
      WHEN pl.cate = 'gb' THEN gb.images
      WHEN pl.cate = 'rt' THEN rt.images
    END AS images,
    CASE
      WHEN pl.cate = 'pd' THEN pd.category_1
      ELSE null
    END AS category_1,
    CASE
      WHEN pl.cate = 'pd' THEN pd.category_2
      ELSE null
    END AS category_2,
    CASE
      WHEN pl.cate = 'pd' THEN pd.brand
      WHEN pl.cate = 'gb' THEN gb.brand
      WHEN pl.cate = 'rt' THEN rt.brand
    END AS brand,
    CASE
      WHEN pl.cate = 'pd' THEN '一般'
      WHEN pl.cate = 'gb' THEN '團購'
      WHEN pl.cate = 'rt' THEN '租用'
    END AS pd_cate
FROM product_like AS pl
LEFT JOIN product AS pd ON pl.cate = 'pd' AND pl.product_id = pd.id
LEFT JOIN group_buy AS gb ON pl.cate = 'gb' AND pl.product_id = gb.id
LEFT JOIN rent AS rt ON pl.cate = 'rt' AND pl.product_id = rt.id
${whereClosure}
${orderbyClosure}
`
  sql += ` LIMIT 5 OFFSET ${page * 5 - 5 || 0}`

  // 獲取喜歡商品的總數
  const total = await count(
    'product_like',
    cate ? { user_id: uid, cate } : { user_id: uid }
  )

  const { rows } = await executeQuery(sql)

  console.log(rows)

  res.json({
    total,
    cate: cate || 'all',
    page: page || 1,
    orderby,
    products: rows,
  })
})

// 取得該會員是否有收藏此商品
router.get('/isLike/:cate/:pid', authenticate, async (req, res, next) => {
  const { cate, pid } = req.params
  console.log(req.user)
  const user = req.user
  const uid = user.id

  const sql = `SELECT IFNULL('true', 'false') AS is_favorite FROM product_like AS pl WHERE product_id=${pid} AND user_id=${uid} AND cate='${cate}'`

  const { rows } = await executeQuery(sql)
  console.log(rows)
  if (rows.length > 0) {
    return res.json({ is_favorite: true })
  } else {
    return res.json({ is_favorite: false })
  }
})

// 新增收藏
router.post('/:cate/:pid', authenticate, async (req, res, next) => {
  const { cate, pid } = req.params

  const user = req.user
  const uid = user.id

  const sql = `INSERT INTO product_like (user_id, product_id, cate) VALUES (${uid}, ${pid}, '${cate}')`

  const { rows } = await executeQuery(sql)

  console.log(rows.affectedRows)

  if (rows.affectedRows) {
    return res.json({ message: '已加入收藏', code: '200' })
  } else {
    return res.json({ message: '加入收藏失敗', code: '400' })
  }
})

// 移除收藏
router.delete('/:cate/:pid', authenticate, async (req, res, next) => {
  const { cate, pid } = req.params
  const user = req.user
  const uid = user.id

  const sql = `DELETE FROM product_like WHERE product_id=${pid} AND user_id=${uid} AND cate='${cate}'; `

  const { rows } = await executeQuery(sql)

  console.log(rows.affectedRows)

  if (rows.affectedRows) {
    return res.json({ message: '已移除收藏', code: '200' })
  } else {
    return res.json({ message: '移除收藏失敗', code: '400' })
  }
})

export default router
