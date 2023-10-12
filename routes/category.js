import express from 'express'
const router = express.Router()
import { find } from '../models/base.js'

router.get('/', async (req, res, next) => {
  const { cat1 } = await find('category_1') // 使用 await 等待查询结果
  const { cat2 } = await find('category_2') // 使用 await 等待查询结果
  res.json({ cat1 })
})

export default router
