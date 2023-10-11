import express from 'express'
const router = express.Router()

import {
  getCommentsWithQS,
  countWithQS,
  getAvgStar,
  addComment,
} from '../models/comment.js'
import { executeQuery } from '../models/base.js'

// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'
import authenticate from '../middlewares/jwt.js'

// 取得所有該商品的評論，並且加入分頁以及篩選星數功能
router.get('/product/:pid', async (req, res, next) => {
  const pid = req.params.pid
  // 獲取網頁的搜尋字串
  const { star, page, orderby, perpage } = req.query

  // TODO: 這裡可以檢查各query string正確性或給預設值，檢查不足可能會產生查詢錯誤

  // 建立資料庫搜尋條件
  const conditions = []
  conditions.push(pid ? `product_id = ${pid}` : '')
  conditions.push(star ? `star = ${star}` : '')
  //各條件為AND相接(不存在時不加入where從句中)
  const conditionsValues = conditions.filter((v) => v)

  // 各條件需要先包含在`()`中，因各自內查詢是OR, 與其它的是AND
  const where =
    conditionsValues.length > 0
      ? `WHERE ` + conditionsValues.map((v) => `( ${v} )`).join(' AND ')
      : ''

  // 分頁用
  // page預設為1，perpage預設為5
  const perpageNow = Number(perpage) || 5
  const pageNow = Number(page) || 1
  const limit = perpageNow
  // page=1 offset=0 ; page=2 offset= perpage * 1; ...
  const offset = (pageNow - 1) * perpageNow

  // 排序用，預設使用預設時間排序，新的在上面
  const order = orderby
    ? { [orderby.split(',')[0]]: orderby.split(',')[1] }
    : { created_time: 'desc' }

  // 查詢
  const total = await countWithQS({ product_id: pid })
  const starTotal = await countWithQS(where)
  //   const { rows } = await executeQuery(
  //     `SELECT AVG(star) AS avg_star FROM comment WHERE product_id = ${pid}`
  //   )
  //   const avgStar = Number(rows[0].avg_star).toFixed(1)
  const avgStar = await getAvgStar(pid)
  const products = await getCommentsWithQS(where, order, limit, offset)

  // json回傳範例
  //
  // {
  //   total: 100,
  //   qsTotal: 100,
  //   perpage: 10,
  //   page: 1,
  //   data:[
  //     {id:123, name:'',...},
  //     {id:123, name:'',...}
  //   ]
  // }

  const result = {
    total,
    star: Number(star) || 'all',
    starTotal,
    avgStar,
    perpage: Number(perpage) || 5,
    page: Number(page) || 1,
    data: products,
  }

  res.json(result)
})

router.post('/add', authenticate, async (req, res, next) => {
  try {
    const user = req.user
    const user_id = user.id
    const { product_id, star, comment } = req.body
    const result = await addComment(product_id, user_id, star, comment)

    if (result) {
      return res.json({ message: '新增成功', code: '200' })
    } else {
      return res.status(400).json({ message: '新增失敗', code: '400' })
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: '新增失敗', code: '400' })
  }
})

export default router
