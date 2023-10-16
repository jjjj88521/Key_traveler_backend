// 資料庫查詢處理函式
import {
  find,
  findOneById,
  insertMany,
  cleanTable,
  count,
  executeQuery,
} from './base.js'
import pool from '../config/db.js'

// 定義資料庫表格名稱
const table = 'order'

// 所需的資料處理函式
// 查詢所有資料
const getOrder = async () => {
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
const getOrderWithQS = async (where = '', order = {}, limit = 0, offset) => {
  const { rows } = await find(table, where, order, limit, offset)
  return rows
}

// 查詢總數用，加入分頁與搜尋字串功能
const countWithQS = async (where = '') => {
  return await count(table, where)
}

// 查詢單一資料，使用id
const getOrderById = async (id) => await findOneById(table, id)

// 建立大量商品資料用
const createBulkOrder = async (users) => await insertMany(table, users)

// 其它用途
// 清除表格資料
const cleanAll = async () => await cleanTable(table)

// 整理所有優惠券(有新增的coupon要更新user_coupon，已過期user_coupon要改變狀態)
const updateUserOrder = async (id) => {
  // 有新增的coupon要更新user_coupon
  const sql = `INSERT INTO user_coupon (user_id, coupon_id, status)
  SELECT u.id, c.id, 1
  FROM users u
  JOIN coupon c ON u.vip = c.vip_id
  WHERE (u.id, c.id) NOT IN (SELECT user_id, coupon_id FROM user_coupon) AND u.id = ${id};`
  await pool.execute(sql)
  // 已過期user_coupon要改變狀態(user_coupon.status = 0)
  const sql1 = `UPDATE user_coupon 
  SET status = 0 
  WHERE user_id = 1
  AND coupon_id IN (
  SELECT id 
  FROM coupon 
  WHERE end_date < CURDATE() 
  AND end_date != '0000-00-00')
  AND status != 2;`
  await pool.execute(sql1)

  const sql2 = `UPDATE user_coupon 
  SET status = 1 
  WHERE user_id = 1
  AND coupon_id IN (
  SELECT id 
  FROM coupon 
  WHERE end_date < CURDATE() 
  AND end_date != '0000-00-00')
  AND status != 2;`
}

export {
  getOrder,
  getOrderWithQS,
  getOrderById,
  createBulkOrder,
  cleanAll,
  countWithQS,
  updateUserOrder,
}
