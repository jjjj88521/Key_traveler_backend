// 資料庫查詢處理函式
import { find, findOneById, insertMany, cleanTable, count } from './base.js'

// 定義資料庫表格名稱
const table = 'product'

// 所需的資料處理函式
// 查詢所有資料
const getProducts = async () => {
  const { rows } = await find(table)
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
const getProductsWithQS = async (where = '', order = {}, limit = 0, offset) => {
  const { rows } = await find(table, where, order, limit, offset)
  return rows
}

// 查詢總數用，加入分頁與搜尋字串功能
const countWithQS = async (where = '') => {
  return await count(table, where)
}

// 查詢單一資料，使用id
const getProductById = async (id) => await findOneById(table, id)

// 建立大量商品資料用
const createBulkProducts = async (users) => await insertMany(table, users)

// 其它用途
// 清除表格資料
const cleanAll = async () => await cleanTable(table)

export {
  getProducts,
  getProductsWithQS,
  getProductById,
  createBulkProducts,
  cleanAll,
  countWithQS,
}
