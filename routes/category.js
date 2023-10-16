import express from 'express'
const router = express.Router()
import { executeQuery } from '../models/base.js'

router.get('/:cat1', async (req, res, next) => {
  const cat1 = req.params.cat1 // 獲取路徑中cat1參數
  const sql = `SELECT id, name FROM category_1 WHERE id = ${cat1};`

  try {
    const { rows } = await executeQuery(sql, [cat1])
    if (rows.length > 0) {
      res.json(rows[0]) // 返回匹配的第一行數據
    } else {
      res.status(404).json({ error: '未能找到匹配的資料' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Database查詢出錯' })
  }
})

router.get('/:cat1/:cat2', async (req, res, next) => {
  const cat2 = req.params.cat2
  const sql = `SELECT id, name FROM category_2 WHERE id = ${cat2};`

  try {
    const { rows } = await executeQuery(sql, [cat2])
    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ error: '未能找到匹配的資料' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Database查詢出錯' })
  }
})

export default router
