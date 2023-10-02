// mysql promise pool
import pool from '../config/db.js'

// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'

// 檢查空物件
import { isEmpty } from '../utils/tool.js'

// 控制是否要呈現除錯訊息
import 'dotenv/config.js'
const debug = process.env.NODE_ENV === 'development'

/**
 * execute sql with pool(promise wrapper), log the sql and error by default
 * @param {string} sql
 * @param {boolean} [logRows=false] If true, log rows
 * @param {boolean} [logFields=false]  If true, log fields
 * @returns {Promise<{rows: array, fields: array}>}
 */
const executeQuery = async (sql, logRows = false, logFields = false) => {
  // limit log string string length
  const sqlLog = sql.length < 1500 ? sql : sql.slice(0, 1500) + '...'
  debug && console.log(sqlLog.bgWhite)

  try {
    const [rows, fields] = await pool.execute(sql)
    debug && logRows && console.log(rows)
    debug && logFields && console.log(fields)
    return { rows, fields }
  } catch (error) {
    console.log('error occurred: ', error)
  }
}

// TODO: use transaction to test a query
// !!create, alert and drop can't rolback
const testQuery = async (query) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const result = await connection.query(query)
    debug && console.log(result)
    //await connection.commit()
    await connection.rollback()
    connection.release()
    debug && console.log(result)

    return result
  } catch (error) {
    debug && console.log(error)
    await connection.rollback()
    connection.release()
  }
}

// TODO: guess db column type from key name or value
const guessDataType = (key, value) => {
  const idNames = ['id', 'pid', 'uid', 'oid']

  if (
    idNames.includes(key) ||
    key.includes('_id') ||
    typeof value === 'number'
  ) {
    return 'int '
  }

  if (
    key.includes('_datetime') ||
    key.includes('_time') ||
    key.includes('_date')
  ) {
    return 'datetime '
  }

  return 'varchar(200) '
}

// generate create sql from object
const generateCreateTableSql = (table, obj) => {
  const sqlColumns = []
  // first item key is primary key
  const primaryKey = Object.keys(obj)[0]

  for (const [key, value] of Object.entries(obj)) {
    if (key === primaryKey) {
      sqlColumns.push(
        `${key} ${guessDataType(key, value)} unsigned NOT NULL AUTO_INCREMENT,`
      )

      continue
    }

    // add default value string
    const defaultValue = guessDataType(key, value).includes('datetime')
      ? ' DEFAULT CURRENT_TIMESTAMP'
      : ' DEFAULT NULL'

    sqlColumns.push(`${key} ${guessDataType(key, value)}${defaultValue},`)
  }

  //const drop = dropTableFirst ? `DROP TABLE IF EXISTS ${table};` : ''
  const first = `CREATE TABLE ${table} (`
  const last = `PRIMARY KEY (${primaryKey}) ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;`

  const sql = [first, ...sqlColumns, last].join(' ')

  return sql
}

// TODO:  create table dynamic form json sample files(simple guess)
const createTable = async (table, obj, dropTableFirst = true) => {
  if (dropTableFirst) {
    await dropTable(table)
  }

  // generate create table sql and execute
  const { rows } = await executeQuery(
    generateCreateTableSql(table, obj, dropTableFirst)
  )

  return rows[0]
}

const dropTable = async (table) => {
  const { rows } = await executeQuery(`DROP TABLE IF EXISTS ${table}`)
  return rows
}

const cleanTable = async (table) => {
  const { rows } = await executeQuery(`TRUNCATE TABLE ${table}`)
  return rows
}

/**
 * test table is existed
 * @param {string} table
 * @returns {boolean}
 */
const testTable = async (table) => {
  try {
    await pool.execute(`SELECT 1 FROM ${table} LIMIT 1;`)
    return true
  } catch (err) {
    return false
  }
}

/**
 * generate where sql string.
 * @param {object|string} objOrString  - ex. {id:1, name:'Eddy'}
 * @param {('AND'|'OR')} [separator="AND"] - join separator
 * @returns {string}
 */
const whereSql = (objOrString, separator = 'AND') => {
  if (typeof objOrString === 'string') return objOrString

  if (isEmpty(objOrString)) return ''

  const where = []
  for (const [key, value] of Object.entries(objOrString)) {
    where.push(`${key} = ${sqlString.escape(value)}`)
  }

  return `WHERE ${where.join(` ${separator} `)}`
}

/**
 * generate orderby sql string.
 * @param {object} obj - ex. {id: 'asc', name: 'desc', username: ''}
 * @returns {string}
 */
const orderbySql = (obj) => {
  if (isEmpty(obj)) return ''

  const orderby = []

  for (const [key, value] of Object.entries(obj)) {
    orderby.push(`${key} ${value}`)
  }

  return `ORDER BY ${orderby.join(', ')}`
}

/**
 * Returns the count of the rows
 * @param {string} table - table name
 * @param {object|string} where - ex. {id:1, name:'Eddy'}, string is for custom where clause ex.'WHERE id > 0'
 * @returns {number}
 */
const count = async (table, where = {}) => {
  const sql = sqlString.format(
    `SELECT COUNT(*) as count FROM ${table} ${whereSql(where)}`
  )

  const { rows } = await executeQuery(sql)
  return rows.length ? rows[0].count : 0
}

/**
 * standard select
 * @param {string} table - table name
 * @param {object|string} where - ex. {id:1, name:'Eddy'}, string is for custom where clause ex.'WHERE id > 0'
 * @param {object} order - ex. {id: 'asc', name: 'desc', username: ''}
 * @param {number} limit - limit number ex.10, default is 0 (ignored it)
 * @param {number|undefined} offset - offset number ex.10, default is undefined (ignored it)
 * @returns {{rows: Array, fields: Array}}
 */
const find = async (table, where = {}, order = {}, limit = 0, offset) => {
  const limitClause = limit ? `LIMIT ${limit}` : ''
  const offsetClause = offset !== undefined ? `OFFSET ${offset}` : ''

  const sql = sqlString.format(
    `SELECT * FROM ${table} ${whereSql(where)} ${orderbySql(
      order
    )} ${limitClause} ${offsetClause}`
  )

  return await executeQuery(sql)
}

/**
 * select return just one row
 * @param {string} table - table name
 * @param {object|string} where - ex. {id:1, name:'Eddy'}, string is for custom where clause ex.'WHERE id > 0'
 * @param {object} order - ex. {id: 'asc', name: 'desc', username: ''}
 * @returns {object}
 */
const findOne = async (table, where = {}, order = {}) => {
  const sql = sqlString.format(
    `SELECT * FROM ${table} ${whereSql(where)} ${orderbySql(order)} LIMIT 0,1`
  )
  const { rows } = await executeQuery(sql)
  //  need only one
  return rows.length ? rows[0] : {}
}

/**
 * select one row by id
 * @param {string} table - table name
 * @param {number|string} id
 * @returns
 */
const findOneById = (table, id) => {
  return findOne(table, { id })
}

/**
 * standard update query
 * @param {string} table
 * @param {object} obj
 * @param {object} where
 * @returns {Array}
 */
const update = async (table, obj, where) => {
  const { rows } = await executeQuery(
    sqlString.format(`UPDATE ${table} SET ? ${whereSql(where)}`, [obj])
  )
  return rows
}

/**
 * update query by id
 * @param {string} table
 * @param {object} obj
 * @param {string|number} id
 * @returns {object}
 */
const updateById = async (table, obj, id) => {
  return update(table, obj, { id })
}

/**
 * insert one row
 * @param {string} table
 * @param {object} obj
 * @returns {object}
 */
// FIXME: array value should convert to csv string, but...object value?
const insertOne = async (table, obj) => {
  const columns = Object.keys(obj)
  // array value convert to csv string
  const data = Object.values(obj).map((v) =>
    Array.isArray(v) ? v.join(',') : v
  )

  const { rows } = await executeQuery(
    sqlString.format(`INSERT INTO ${table} (??) VALUES (?)`, [columns, data])
  )

  return rows
}

/**
 * insert rows
 * @param {string} table
 * @param {Array} array - array of object
 * @returns {object}
 */
const insertMany = async (table, array) => {
  const columns = Object.keys(array[0])
  // FIXME: array value should convert to csv string, but...object value?
  const data = array.map((v) =>
    Object.values(v).map((v) => (Array.isArray(v) ? v.join(',') : v))
  )

  const { rows } = await executeQuery(
    sqlString.format(`INSERT INTO ${table} (??) VALUES ?`, [columns, data])
  )

  return rows
}

/**
 * standard delete query
 * @param {string} table
 * @param {object} where
 * @returns {object}
 */
const remove = async (table, where) => {
  const { rows } = await executeQuery(
    sqlString.format(`DELETE FROM ${table} ${whereSql(where)}`)
  )

  return rows
}

const removeById = async (table, id) => {
  return remove(table, { id })
}

export {
  cleanTable,
  count,
  createTable,
  dropTable,
  executeQuery,
  find,
  findOne,
  findOneById,
  insertMany,
  insertOne,
  remove,
  removeById,
  testQuery,
  testTable,
  update,
  updateById,
}
