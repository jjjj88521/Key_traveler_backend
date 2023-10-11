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
  addComment,
  // ArtCotentUser,
} from '../models/article.js'
import authenticate from '../middlewares/jwt.js'

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
// router.get('/artuser/:artuserid', async (req, res, next) => {
//   const artuser = await ArtCotentUser(req.params.artuserid)
//   res.json({ artuser })
// })

router.get('/comment/:commentid', async (req, res, next) => {
  // 透過sql語法 comments裡的article id都相同
  const comments = await comment(req.params.commentid)
  res.json({ comments })
  // 等同於res.json({ cates: cates })，只要{}內的key,value同名 可以合併
})

router.post('/addComment', authenticate, async (req, res, next) => {
  const user = req.user
  const user_id = user.id
  const { article_id, comment } = req.body
  // console.log(req.body)

  // console.log('addComent')
  // console.log(req.body)
  console.log(user)
  const newComment = await addComment(user_id, article_id, comment)
  res.json({
    msg: '成功新增資料',
    code: '200',
    newComment: {
      user_id,
      article_id,
      comment,
    },
  })
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
