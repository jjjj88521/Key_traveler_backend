// 資料庫查詢處理函式
import {
  find,
  findOneById,
  insertMany,
  cleanTable,
  count,
  count_column,
  comment_list,
  insertOne,
} from './base.js'

// 定義資料庫表格名稱
const table = 'article'
const table_user = 'users'
const table_comment = 'article_comment'
// 所需的資料處理函式
// 查詢所有資料
const getArticles = async () => {
  const { rows } = await find(table)
  return rows
}

// const getUsers = async () => {
//   const { rows } = await find(table_user)
//   return rows
// }
// const getArticleComment = async () => {
//   const { rows } = await find(table_comment)
//   return rows
// }
// const getCommentById = async (id) => await findOneById(table_comment, id)
const comment = async (article_id) => {
  const { rows } = await comment_list(table_user, table_comment, article_id)
  return rows
}
// 查詢所有cate
const countColumn = async (groupby = 'cate') => {
  const { rows } = await count_column(table, groupby)
  return rows
}

// 查詢所有資料，加入分頁與搜尋字串功能
// SELECT *
// FROM product
// WHERE  name LIKE '%Awesome%'
//        AND cat_id IN (1,2,3)
//        AND (
//               FIND_IN_SET(1, color)
//               OR FIND_IN_SET(2, color)
//        )
//        AND (FIND_IN_SET(3, tag))
//        AND (
//               FIND_IN_SET(1, size)
//               OR FIND_IN_SET(2, size)
//        )
// ORDER BY id
// LIMIT 0 OFFSET 10;
const getArticlesWithQS = async (where = '', order = {}, limit = 0, offset) => {
  const { rows } = await find(table, where, order, limit, offset)
  return rows
}

// 查詢總數用，加入分頁與搜尋字串功能
const countWithQS = async (where = '') => {
  return await count(table, where)
}

// 查詢單一資料，使用id
const getArticleById = async (id) => await findOneById(table, id)

// 新增單一comment資料
const addComment = async (comment) => await insertOne(table_comment, comment)

// 建立大量商品資料用
const createBulkArticle = async (users) => await insertMany(table, users)

// 其它用途
// 清除表格資料
const cleanAll = async () => await cleanTable(table)

export {
  getArticles,
  getArticlesWithQS,
  getArticleById,
  createBulkArticle,
  cleanAll,
  countWithQS,
  countColumn,
  comment,
  addComment,
}
