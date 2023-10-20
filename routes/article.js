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
//新增使用者開箱文
router.post('/addForm', async (req, res, next) => {
  console.log(req)
})
router.post('/1123', async function (req, res, next) {
  console.log(req.body)
  const { title, content, cateSelect } = req.body
  // console.log(res)

  try {
    const sql = `INSERT INTO article (user_id, title, article, cate) VALUES (${title}, ${content}, ${cateSelect}, 1)`
    const { rows } = await executeQuery(sql)

    if (rows.affectedRows) {
      return res.json({ message: '已新增貼文', code: '200' })
    } else {
      return res.json({ message: '新增貼文失敗', code: '400' })
    }
  } catch (error) {
    console.error('Error adding like:', error)
    return res.status(500).json({ message: '伺服器錯誤', code: '500' })
  }
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
  const sqlTotal = `SELECT COUNT(al.id) AS total FROM article AS a LEFT JOIN article_like AS al ON a.id = al.article_id ${
    cate
      ? `WHERE cate = '${cate}' AND al.user_id = ${user_id}`
      : `WHERE al.user_id = ${user_id}`
  }`
  const totalResult = await executeQuery(sqlTotal)
  const total = totalResult.rows[0].total
  // console.log(total)
  // const total = await count(
  //   'article_like',
  //   cate ? { user_id, cate } : { user_id }
  // )

  const { rows } = await executeQuery(sql)

  const result = {
    total: total,
    cate: cate ? cate : 'all',
    page: page || 1,
    article: rows || [],
  }

  res.json(result)
})

// 取得使用者是否收藏此文章
router.get('/like/:aid', authenticate, async (req, res, next) => {
  const { aid } = req.params
  const uid = req.user.id

  const sql = `SELECT IFNULL('true', 'false') AS is_favorite FROM article_like AS pl WHERE article_id=${aid} AND user_id=${uid}`

  const { rows } = await executeQuery(sql)

  if (rows.length > 0) {
    return res.json({ article_id: aid, is_liked: true })
  } else {
    return res.json({ article_id: aid, is_liked: false })
  }
})

// 刪除登入的使用者指定的收藏文章
router.delete('/like/:aid', authenticate, async (req, res, next) => {
  const user_id = req.user.id
  const { aid } = req.params
  // 刪除單筆收藏文章的 sql
  const sql = `DELETE FROM article_like WHERE article_id=${aid} AND user_id=${user_id}`

  const { rows } = await executeQuery(sql)

  console.log(rows)
  if (rows.affectedRows) {
    return res.json({ message: '已移除收藏', code: '200' })
  } else {
    return res.json({ message: '移除收藏失敗', code: '400' })
  }
})
// 新增登入的使用者指定的收藏文章
router.post('/like/:aid', authenticate, async (req, res, next) => {
  const user_id = req.user.id
  const { aid } = req.params

  try {
    const sql = `INSERT INTO article_like (user_id, article_id) VALUES (${user_id}, ${aid})`
    // const params = [user_id, aid]
    const { rows } = await executeQuery(sql)

    if (rows.affectedRows) {
      return res.json({ message: '已收藏文章', code: '200' })
    } else {
      return res.json({ message: '收藏文章失敗', code: '400' })
    }
  } catch (error) {
    console.error('Error adding like:', error)
    return res.status(500).json({ message: '伺服器錯誤', code: '500' })
  }
})

// 獲得單筆資料
router.get('/:aid', async (req, res, next) => {
  console.log(req.params)

  // 讀入範例資料
  const singleArticle = await getArticleById(req.params.aid)

  // 找作者
  const authorSql = `SELECT 
                      CASE 
                        WHEN a.user_id = 0 THEN '鍵之旅人' 
                        ELSE u.account
                        END AS author 
                      FROM article a 
                      LEFT JOIN users u ON a.user_id = u.id 
                      WHERE a.id=${req.params.aid}`

  const { rows } = await executeQuery(authorSql)
  console.log(rows)
  const author = rows[0].author

  if (singleArticle) {
    return res.json({ ...singleArticle, author })
  } else {
    return res.json({})
  }
})

export default router
