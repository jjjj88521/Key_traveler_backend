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
import { executeQuery, count } from '../models/base.js'
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

// 獲取登入的使用者的收藏文章
router.get('/like-list', authenticate, async (req, res, next) => {
  const user_id = req.user.id

  const { cate, page } = req.query

  // const sql = `SELECT a.cate AS cate, COUNT(al.article_id) AS count
  // FROM article_like AS al
  // LEFT JOIN article AS a ON al.article_id = a.id
  // WHERE al.user_id = ${user_id}
  // GROUP BY a.cate
  // `
  const sql = `SELECT
  a.id AS id,
  a.title AS title,
  a.img AS img,
  a.cate AS cate
FROM
  article_like al
JOIN
  article a ON al.article_id = a.id
WHERE
  al.user_id = ${user_id}
  ${cate === '全部' || !cate ? '' : `AND a.cate = "${cate}"`}
LIMIT 5 OFFSET ${page * 5 - 5 || 0}
  `
  // 使用者收藏文章的總數
  const total = await count('article_like', { user_id })

  const { rows } = await executeQuery(sql)

  const result = {
    total,
    cate,
    page: page || 1,
    article: rows || [],
  }

  res.json(result)
})

// 刪除登入的使用者指定的收藏文章
router.delete('/like/:aid', authenticate, async (req, res, next) => {
  const user_id = req.user.id
  const { aid } = req.params
  // 刪除單筆收藏文章的 sql
  const sql = `DELETE FROM article_like WHERE article_id = ${aid} AND user_id = ${user_id}`

  const { rows } = await executeQuery(sql)

  if (rows.affectedRows) {
    return res.json({ message: '已移除收藏', code: '200' })
  } else {
    return res.json({ message: '移除收藏失敗', code: '400' })
  }
})

// 獲得單筆資料
router.get('/:aid', async (req, res, next) => {
  console.log(req.params)

  // 讀入範例資料
  const singleArticle = await getArticleById(req.params.aid)

  if (singleArticle) {
    return res.json({ ...singleArticle })
  } else {
    return res.json({})
  }
})

export default router
