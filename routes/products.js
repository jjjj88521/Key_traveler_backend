import express from 'express'
const router = express.Router()

import { readJsonFile } from '../utils/json-tool.js'

import {
  getProducts,
  getProductsWithQS,
  getProductById,
  countWithQS,
} from '../models/products.js'
// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'
import { executeQuery } from '../models/base.js'

// 獲得所有資料，加入分頁與搜尋字串功能，單一資料表處理
// products/qs?page=1&keyword=xxxx&cat_ids=1,2&sizes=1,2&tags=3,4&colors=1,2,3&orderby=id,asc&perpage=10&price_range=1500,10000
router.get('/qs', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const {
    page,
    keyword,
    // cat_ids,
    cate_1,
    cate_2,
    // colors,
    // tags,
    // sizes,
    orderby,
    perpage,
    price_range,
    brand,
  } = req.query

  // TODO: 這裡可以檢查各query string正確性或給預設值，檢查不足可能會產生查詢錯誤

  // 建立資料庫搜尋條件
  const conditions = []

  // 關鍵字 keyword 使用 `name LIKE '%keyword%'`
  //   conditions[0] = keyword
  //     ? `name LIKE ${sqlString.escape('%' + keyword + '%')}`
  //     : ''

  conditions.push(
    keyword ? `name LIKE ${sqlString.escape('%' + keyword + '%')}` : ''
  )

  conditions.push(brand ? `brand = ${brand}` : '')

  // 分類，cat_id 使用 `cat_id IN (1, 2, 3, 4, 5)`
  //   conditions[1] = cat_ids ? `cat_id IN (${cat_ids})` : ''
  conditions.push(cate_1 ? `category_1 IN (${cate_1})` : '')
  conditions.push(cate_2 ? `category_2 IN (${cate_2})` : '')
  //   console.log(conditions)

  // 顏色: FIND_IN_SET(1, color) OR FIND_IN_SET(2, color)
  //   const color_ids = colors ? colors.split(',') : []
  //   conditions[2] = color_ids
  //     .map((v) => `FIND_IN_SET(${Number(v)}, color)`)
  //     .join(' OR ')

  //  標籤: FIND_IN_SET(3, tag) OR FIND_IN_SET(2, tag)
  //   const tag_ids = tags ? tags.split(',') : []
  //   conditions[3] = tag_ids
  //     .map((v) => `FIND_IN_SET(${Number(v)}, tag)`)
  //     .join(' OR ')

  //  尺寸: FIND_IN_SET(3, size) OR FIND_IN_SET(2, size)
  //   const size_ids = sizes ? sizes.split(',') : []
  //   conditions[4] = size_ids
  //     .map((v) => `FIND_IN_SET(${Number(v)}, size)`)
  //     .join(' OR ')

  // 價格
  const priceRanges = price_range ? price_range.split(',') : []
  const min = Number(priceRanges[0])
  const max = Number(priceRanges[1])
  // 價格要介於1500~10000間
  if (min >= 0 && max <= 99999) {
    conditions.push(`price BETWEEN ${min} AND ${max}`)
  }

  //各條件為AND相接(不存在時不加入where從句中)
  const conditionsValues = conditions.filter((v) => v)
  console.log(conditionsValues)

  // 各條件需要先包含在`()`中，因各自內查詢是OR, 與其它的是AND
  const where =
    conditionsValues.length > 0
      ? `WHERE ` + conditionsValues.map((v) => `( ${v} )`).join(' AND ')
      : ''

  // 分頁用
  // page預設為1，perpage預設為10
  const perpageNow = Number(perpage) || 12
  const pageNow = Number(page) || 1
  const limit = perpageNow
  // page=1 offset=0 ; page=2 offset= perpage * 1; ...
  const offset = (pageNow - 1) * perpageNow

  // 排序用，預設使用id, asc
  const order = orderby
    ? { [orderby.split(',')[0]]: orderby.split(',')[1] }
    : { id: 'asc' }

  // 查詢
  const total = await countWithQS(where)
  const products = await getProductsWithQS(where, order, limit, offset)

  // json回傳範例
  //
  // {
  //   total: 100,
  //   perpage: 10,
  //   page: 1,
  //   data:[
  //     {id:123, name:'',...},
  //     {id:123, name:'',...}
  //   ]
  // }

  const result = {
    total,
    perpage: Number(perpage) || 12,
    page: Number(page) || 1,
    price_range,
    data: products,
  }

  res.json(result)
})

// 獲取該分類商品所有的品牌
router.get('/brands', async (req, res, next) => {
  const { cate_1, cate_2 } = req.query
  let conditions = []
  conditions.push(cate_1 ? `category_1 = ${cate_1}` : '')
  conditions.push(cate_2 ? `category_2 = ${cate_2}` : '')
  const conditionsValues = conditions.filter((v) => v)
  // console.log(conditionsValues)
  const where =
    conditionsValues.length > 0
      ? `WHERE ` + conditionsValues.map((v) => `( ${v} )`).join(' AND ')
      : ''
  const sql = sqlString.format(`SELECT DISTINCT brand FROM ?? ${where}`, [
    'product',
  ])
  const { rows } = await executeQuery(sql)
  if (rows.length === 0) {
    return res.json([])
  } else {
    const brands = rows.map((v) => v.brand) // 將品牌整理成陣列
    return res.json(brands)
  }
})

// 獲得單筆資料
router.get('/:pid', async (req, res, next) => {
  console.log(req.params)

  // 讀入範例資料
  const product = await getProductById(req.params.pid)

  if (product) {
    return res.json({ ...product })
  } else {
    return res.json({})
  }
})

// 獲取你可能會喜歡的商品
router.get('/:pid/maybe-like', async (req, res, next) => {
  const { pid } = req.params

  // 隨機挑八個相同分類的商品
  const sql = `SELECT id, name, brand, category_1, category_2, price, images, stock
               FROM product
               WHERE id NOT IN (${pid}) AND stock != 0
               AND category_1 IN (SELECT category_1 FROM product WHERE id = ${pid})
               AND category_2 IN (SELECT category_2 FROM product WHERE id = ${pid})
               ORDER BY RAND()
               LIMIT 8`

  const { rows } = await executeQuery(sql)

  if (rows.length > 0) {
    return res.json(rows)
  } else {
    return res.json([])
  }
})

// 獲得所有資料
router.get('/', async (req, res, next) => {
  // 讀入範例資料
  const products = await getProducts()
  res.json({ products })
})

export default router
