// 資料庫查詢處理函式
import {
  find,
  count,
  findOneById,
  insertOne,
  insertMany,
  remove,
  updateById,
  cleanTable,
  findOne,
} from './base.js'

// 定義資料庫表格名稱
const table = 'users'

// 所需的資料處理函式
const getUsers = async () => {
  const { rows } = await find(table)
  return rows
}
const getUserById = async (id) => await findOneById(table, id)
const getCount = async (where) => await count(table, where)
const createUser = async (user) => await insertOne(table, user)
const createBulkUsers = async (users) => await insertMany(table, users)
const deleteUserById = async (id) => await remove(table, { id })

// 針對PUT更新user資料
const updateUserById = async (user, id) => await updateById(table, user, id)
const updateUser = async (user) => await updateById(table, user, user.id)

// 登入使用
const verifyUser = async ({ username, password }) =>
  Boolean(await count(table, { username, password }))

const getUser = async ({ username, password }) =>
  await findOne(table, { username, password })

// 其它用途
const cleanAll = async () => await cleanTable(table)

export {
  cleanAll,
  createBulkUsers,
  createUser,
  deleteUserById,
  getCount,
  getUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserById,
  verifyUser,
}
