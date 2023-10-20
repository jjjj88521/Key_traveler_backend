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
const table = 'comment'

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

export { addComment }
