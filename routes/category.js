import express from 'express'
const router = express.Router()
import { find } from '../models/base.js'

router.get('/', async (req, res, next) => {
  const { rows } = await find('category_1') // 使用 await 等待查询结果
  res.json({ rows })
})

export default router
