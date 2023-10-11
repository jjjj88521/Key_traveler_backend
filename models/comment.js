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
  const sql = sqlString.format(
    `SELECT ??.*, ?? AS user_account, ?? AS user_avatar FROM ?? INNER JOIN ?? ON ?? = ?? ${whereSql(
      where
    )} ${orderbySql(order)} ${limitClause} ${offsetClause}`,
    [
      table,
      'users.account',
      'users.avatar_img',
      table,
      'users',
      'comment.user_id',
      'users.id',
    ]
  )

  const { rows } = await executeQuery(sql)
  return rows
}

// 查詢總數用，加入分頁與搜尋字串功能
const countWithQS = async (where = '') => {
  return await count(table, where)
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

const addComment = async (product_id, user_id, star, comment) => {
  await insertOne(table, {
    product_id,
    user_id,
    star,
    comment,
  })
}

export { getCommentsWithQS, countWithQS, getAvgStar, addComment }
