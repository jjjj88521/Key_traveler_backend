import express from 'express'
import 'dotenv/config.js'

const router = express.Router()
import {
  getArticles,
  getArticlesWithQS,
  getArticleById,
  createBulkArticle,
  cleanAll,
  countWithQS,
  countColumn,
  comment,
} from '../models/article.js'

/* 寄送email的路由 */
router.get('/test', function (req, res, next) {})
// 獲得所有資料
router.get('/', async (req, res, next) => {
  // 讀入範例資料
  const articles = await getArticles()
  res.json({ articles })
})
router.get('/count_cate', async (req, res, next) => {
  // 讀入範例資料
  const cates = await countColumn()
  res.json({ cates })
  // 等同於res.json({ cates: cates })，只要{}內的key,value同名 可以合併
})

router.get('/comment/:commentid', async (req, res, next) => {
  // 透過sql語法 comments裡的article id都相同
  const comments = await comment(req.params.commentid)
  res.json({ comments })
  // 等同於res.json({ cates: cates })，只要{}內的key,value同名 可以合併
})

// 獲得單筆資料
router.get('/:pid', async (req, res, next) => {
  console.log(req.params)

  // 讀入範例資料
  const singleArticle = await getArticleById(req.params.pid)

  if (singleArticle) {
    return res.json({ ...singleArticle })
  } else {
    return res.json({})
  }
})
export default router
