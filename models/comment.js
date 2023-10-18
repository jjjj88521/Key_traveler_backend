// 資料庫查詢處理函式
import {
  executeQuery,
  count,
  findOne,
  insertOne,
  find,
  whereSql,
  orderbySql,
} from './base.js'

// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'

// 定義資料庫表格名稱
const table = 'comment'

// 取得所有該商品的評論
const getCommentsWithQS = async (where = '', order = {}, limit = 0, offset) => {
  const limitClause = limit ? `LIMIT ${limit}` : ''
  const offsetClause = offset !== undefined ? `OFFSET ${offset}` : ''

  // 將規格為空字串取代為單一規格
  const sql = sqlString.format(
    `SELECT c.*, u.account AS user_account, u.avatar AS user_avatar, 
    CASE 
      WHEN c.style = '' THEN '["單一規格"]'
      ELSE c.style 
    END AS style
    FROM ?? AS c
    INNER JOIN users AS u
    ON c.user_id = u.id
    ${whereSql(where)} ${orderbySql(order)} ${limitClause} ${offsetClause}`,
    [table]
  )

  const { rows } = await executeQuery(sql)
  return rows
}

// 查詢總數用，加入分頁與搜尋字串功能
const countWithQS = async (where = '') => {
  return await count(table, where)
}

// 算出各個星樹的評論數量
const conutEachStar = async (pid) => {
  const sql = sqlString.format(
    `SELECT starTable.star, COALESCE(comments.count, 0) AS count
     FROM (
       SELECT 5 AS star
       UNION SELECT 4
       UNION SELECT 3
       UNION SELECT 2
       UNION SELECT 1
     ) AS starTable
     LEFT JOIN (
       SELECT star, COUNT(*) AS count
       FROM ?? 
       WHERE product_id = ?
       GROUP BY star
     ) AS comments
     ON starTable.star = comments.star`,
    [table, pid]
  )
  const { rows } = await executeQuery(sql)
  return rows
}

const getAvgStar = async (pid) => {
  const sql = sqlString.format(
    `SELECT AVG(star) AS avg_star FROM ?? WHERE product_id = ?`,
    [table, pid]
  )
  const { rows } = await executeQuery(sql)

  const avgStar = Number(rows[0].avg_star).toFixed(1)
  return avgStar
}

const addComment = async (product_id, user_id, star, comment, style) => {
  const rows = await insertOne(table, {
    product_id,
    user_id,
    star,
    comment,
    style,
  })
  return rows
}

export { getCommentsWithQS, countWithQS, getAvgStar, addComment, conutEachStar }
