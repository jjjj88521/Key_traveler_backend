// 資料庫查詢處理函式
import {
  find,
  findOne,
  insertOne,
  insertMany,
  count,
  executeQuery,
} from './base.js'

// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'

// 定義資料庫表格名稱
const table = 'user_comment'

// 所需的資料處理函式
// 查詢所有資料
const getUserComment = async () => {
  const { rows } = await find(table)
  return rows
}

// 取得所有該會員的評論
const getUserCommentsWithQS = async (
  where = '',
  order = {},
  limit = 0,
  offset
) => {
  const { rows } = await find(table, where, order, limit, offset)
  return rows
}

// 查詢總數用，加入分頁與搜尋字串功能
const countWithQS = async (where = '') => {
  return await count(table, where)
}

const addComment = async (product_id, user_id, star, description) => {
  const rows = await insertOne(table, {
    product_id,
    user_id,
    star,
    description,
  })
  return rows
}

export { getUserComment, getUserCommentsWithQS, countWithQS, addComment }
