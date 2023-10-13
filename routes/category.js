import express from 'express'
const router = express.Router()
import { executeQuery } from '../models/base.js'

router.get('/', async (req, res, next) => {
  const sql = `SELECT * FROM category_2;`
  const { rows } = await executeQuery(sql)
  res.json({ rows })
})

export default router
