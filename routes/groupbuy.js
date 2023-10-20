import express from 'express'
const router = express.Router()

import { readJsonFile } from '../utils/json-tool.js'

import {
  getAllGBList,
  getGBListWithQS,
  getGroupbuyById,
  createBulkGroupbuy,
  countWithQS,
  cleanAll,
} from '../models/groupbuy.js'
// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'
import { executeQuery } from '../models/base.js'

// 獲得所有資料，加入分頁與搜尋字串功能，單一資料表處理
// groupbuy/qs?page=1&keyword=xxxx&cat_ids=1,2&sizes=1,2&tags=3,4&colors=1,2,3&orderby=id,asc&perpage=10&price_range=1500,10000
router.get('/qs', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const {
    page,
    keyword,
    // cat_ids,
    // cate_1,
    // cate_2,
    status, // 團購狀態 wait:即將開團 run:團購中 end:團購結束
    orderby,
    perpage,
    price_range,
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

  // 篩選團購狀態
  // 狀態值可以是一個字串，如"wait,run"，我們將它分割成陣列
  const statusValues = status ? status.split(',') : []

  // 創建一個陣列來存放每個狀態值的查詢條件
  const statusConditions = statusValues.map((value) => {
    if (value === 'wait') {
      return `start > NOW()`
    } else if (value === 'run') {
      return `start <= NOW() AND end >= NOW()`
    } else if (value === 'end') {
      return `end < NOW()`
    }
  })

  // 使用 OR 來連接每個狀態查詢條件
  const combinedStatusCondition = statusConditions.join(' OR ')

  // 將狀態查詢條件添加到條件陣列中
  conditions.push(combinedStatusCondition)

  // conditions.push(cate_1 ? `category_1 IN (${cate_1})` : '')
  // conditions.push(cate_2 ? `category_2 IN (${cate_2})` : '')
  //   console.log(conditions)

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
  const gbData = await getGBListWithQS(where, order, limit, offset)

  const result = {
    total,
    status,
    perpage: Number(perpage) || 12,
    page: Number(page) || 1,
    price_range,
    data: gbData,
  }

  res.json(result)
})

// 獲得單筆資料
router.get('/:pid', async (req, res, next) => {
  console.log(req.params)

  // 讀入範例資料
  const groupbuy = await getGroupbuyById(req.params.pid)

  if (groupbuy) {
    return res.json({ ...groupbuy })
  } else {
    return res.json({})
  }
})

// // 獲取你可能會喜歡的商品
// router.get('/:pid/maybe-like', async (req, res, next) => {
//   const { pid } = req.params

//   // 隨機挑八個相同分類的商品
//   const sql = `SELECT id, name, brand, category_1, category_2, price, images, stock
//                FROM product
//                WHERE id NOT IN (${pid}) AND stock != 0
//                AND category_1 IN (SELECT category_1 FROM product WHERE id = ${pid})
//                AND category_2 IN (SELECT category_2 FROM product WHERE id = ${pid})
//                ORDER BY RAND()
//                LIMIT 8`

//   const { rows } = await executeQuery(sql)

//   if (rows.length > 0) {
//     return res.json(rows)
//   } else {
//     return res.json([])
//   }
// })

// 獲得所有資料
router.get('/', async (req, res, next) => {
  // 讀入範例資料
  const gbData = await getAllGBList()
  res.json({ gbData })
})

export default router
