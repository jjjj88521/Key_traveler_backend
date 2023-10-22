import express from 'express'
const router = express.Router()
import authenticate from '../middlewares/jwt.js'
import { executeQuery } from '../models/base.js'
import pool from '../config/db.js'

// router.post("/")

// ===================== 一般商品 =====================
router.get('/product', authenticate, async (req, res) => {
  const sqlPd = `SELECT product.name, product.images, product.price, cart.is_checked, cart.amount, cart.spec, product.id, product.brand, product.style_select
    FROM cart
    INNER JOIN product ON cart.product_id = product.id WHERE cart.user_id = ${req.user.id};`

  const { rows } = await executeQuery(sqlPd)

  const cartP = rows.map((v) => ({
    id: v.id,
    check: v.is_checked,
    img: '/images/product/' + JSON.parse(v.images)[0],
    brand: v.brand,
    name: v.name,
    price: v.price,
    quantity: v.amount,
    spec: JSON.parse(v.style_select),
    specData: JSON.parse(v.spec),
  }))
  return res.json({ message: 'authorized', cartP })
})
// 新增商品
router.post('/addproduct', authenticate, async (req, res) => {
  const { rows } = await executeQuery(
    `SELECT spec,product_id FROM cart WHERE user_id = ${req.user.id}`
  )

  for (const v of rows) {
    if (
      JSON.stringify(JSON.parse(v.spec)) ===
        JSON.stringify(req.body.specData) &&
      v.product_id === req.body.id
    ) {
      const spec = JSON.stringify(req.body.specData)
      const updateSql = `UPDATE cart SET amount = amount + ${req.body.quantity} WHERE product_id = ${req.body.id} AND spec = '${spec}'`
      const [result, fields] = await pool.execute(updateSql)
      if (!result.length) {
        return res.json({
          message: 'success',
          code: '201',
          quantity: req.body.quantity,
        })
      }
    }
  }
  const newSpec = JSON.stringify(req.body.specData)
  const newSql = `INSERT INTO cart (user_id, product_id, amount,spec,is_checked)
    VALUES (${req.user.id}, ${req.body.id},${req.body.quantity}, '${newSpec}',0);`
  await pool.execute(newSql)
  return res.json({ message: 'authorized', code: '200' })
})
// 購物車頁面商品數量-1
router.post('/minusproduct', authenticate, async (req, res) => {
  const firstSql = `SELECT id,amount,spec FROM cart WHERE user_id = ${req.user.id} AND product_id = ${req.body.id}`
  // 先找出amount
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      if (v.amount > 1) {
        const updateSql = `UPDATE cart SET amount = amount - 1 WHERE id = ${v.id}`

        await pool.execute(updateSql)

        return res.json({ message: 'success', code: '200' })
      } else {
        const deleteSql = `DELETE FROM cart WHERE id = ${v.id}`
        await pool.execute(deleteSql)

        return res.json({ message: 'success', code: '201' })
      }
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 購物車頁面商品數量+1
router.post('/plusproduct', authenticate, async (req, res) => {
  const firstSql = `SELECT id,amount,spec FROM cart WHERE user_id = ${req.user.id} AND product_id = ${req.body.id}`
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const updateSql = `UPDATE cart SET amount = amount + 1 WHERE id = ${v.id}`

      await pool.execute(updateSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 刪除購物車
router.post('/deleteproduct', authenticate, async (req, res) => {
  const firstSql = `SELECT id,amount,spec FROM cart WHERE user_id = ${req.user.id} AND product_id = ${req.body.id}`
  // 先找出amount
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const deleteSql = `DELETE FROM cart WHERE id = ${v.id}`
      await pool.execute(deleteSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 勾選
router.post('/checkproduct', authenticate, async (req, res) => {
  const firstSql = `SELECT id,is_checked,spec FROM cart WHERE user_id = ${req.user.id} AND product_id = ${req.body.id}`
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const updateSql = `UPDATE cart SET is_checked = ${!v.is_checked} WHERE id = ${
        v.id
      }`

      await pool.execute(updateSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 勾選全部
router.post('/checkallproduct', authenticate, async (req, res) => {
  const check = req.body.checkAll ? 1 : 0
  const updateSql = `UPDATE cart SET is_checked = ${check} WHERE user_id = ${req.user.id}`

  await pool.execute(updateSql)

  return res.json({ message: 'success', code: '200' })
})

// ===================== 團購商品 =====================
router.get('/groupbuy', authenticate, async (req, res) => {
  const sqlPd = `SELECT group_buy.name, group_buy.images, group_buy.price, cart_group.is_checked, cart_group.amount, cart_group.spec, group_buy.id, group_buy.brand, group_buy.style_select
      FROM cart_group
      INNER JOIN group_buy ON cart_group.groupbuy_id = group_buy.id WHERE cart_group.user_id = ${req.user.id};`

  const { rows } = await executeQuery(sqlPd)

  const cartG = rows.map((v) => ({
    id: v.id,
    check: v.is_checked,
    img: '/images/product/' + JSON.parse(v.images)[0],
    brand: v.brand,
    name: v.name,
    price: v.price,
    quantity: v.amount,
    spec: JSON.parse(v.style_select),
    specData: JSON.parse(v.spec),
  }))
  return res.json({ message: 'authorized', cartG })
})
// 新增商品
router.post('/addgroupbuy', authenticate, async (req, res) => {
  const { rows } = await executeQuery(
    `SELECT spec,groupbuy_id FROM cart_group WHERE user_id = ${req.user.id}`
  )

  for (const v of rows) {
    if (
      JSON.stringify(JSON.parse(v.spec)) ===
        JSON.stringify(req.body.specData) &&
      v.groupbuy_id === req.body.id
    ) {
      const spec = JSON.stringify(req.body.specData)
      const updateSql = `UPDATE cart_group
            SET amount = amount + ${req.body.quantity}
            WHERE groupbuy_id = ${req.body.id} AND spec = '${spec}'`
      const [result, fields] = await pool.execute(updateSql)
      if (!result.length) {
        return res.json({
          message: 'success',
          code: '201',
          quantity: req.body.quantity,
        })
      }
    }
  }
  const newSpec = JSON.stringify(req.body.specData)
  const newSql = `INSERT INTO cart_group (user_id, groupbuy_id, amount,spec,is_checked)
      VALUES (${req.user.id}, ${req.body.id},${req.body.quantity}, '${newSpec}',0);`
  await pool.execute(newSql)
  return res.json({ message: 'authorized', code: '200' })
})
// 購物車頁面商品數量-1
router.post('/minusgroupbuy', authenticate, async (req, res) => {
  const firstSql = `SELECT id,amount,spec FROM cart_group WHERE user_id = ${req.user.id} AND groupbuy_id = ${req.body.id}`
  // 先找出amount
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const updateSql =
        v.amount > 1
          ? `UPDATE cart_group
              SET amount = amount - 1
              WHERE id = ${v.id}`
          : `DELETE FROM cart_group WHERE id = ${v.id}`
      await pool.execute(updateSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 購物車頁面商品數量+1
router.post('/plusgroupbuy', authenticate, async (req, res) => {
  const firstSql = `SELECT id,amount,spec FROM cart_group WHERE user_id = ${req.user.id} AND groupbuy_id = ${req.body.id}`
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const updateSql = `UPDATE cart_group SET amount = amount + 1 WHERE id = ${v.id}`

      await pool.execute(updateSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 刪除購物車
router.post('/deletegroupbuy', authenticate, async (req, res) => {
  const test = 'cart_post12345_authenticate'
  const firstSql = `SELECT id,amount,spec FROM cart_group WHERE user_id = ${req.user.id} AND groupbuy_id = ${req.body.id}`
  // 先找出amount
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const deleteSql = `DELETE FROM cart_group WHERE id = ${v.id}`
      await pool.execute(deleteSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 勾選
router.post('/checkgroupbuy', authenticate, async (req, res) => {
  const firstSql = `SELECT id,is_checked,spec FROM cart_group WHERE user_id = ${req.user.id} AND groupbuy_id = ${req.body.id}`
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const updateSql = `UPDATE cart_group SET is_checked = ${!v.is_checked} WHERE id = ${
        v.id
      }`

      await pool.execute(updateSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 勾選全部
router.post('/checkallgroupbuy', authenticate, async (req, res) => {
  const check = req.body.checkAll ? 1 : 0
  const updateSql = `UPDATE cart_group SET is_checked = ${check} WHERE user_id = ${req.user.id}`

  await pool.execute(updateSql)

  return res.json({ message: 'success', code: '200' })
})

// ===================== 租用商品 =====================
router.get('/rent', authenticate, async (req, res) => {
  const sqlPd = `SELECT rent.name, rent.images, rent.price, cart_rent.is_checked, cart_rent.start, cart_rent.end, cart_rent.spec, rent.id, rent.brand, rent.style_select
      FROM cart_rent
      INNER JOIN rent ON cart_rent.rent_id = rent.id WHERE cart_rent.user_id = ${req.user.id};`

  const { rows } = await executeQuery(sqlPd)

  const cartR = rows.map((v) => ({
    id: v.id,
    check: v.is_checked,
    img: '/images/product/' + JSON.parse(v.images)[0],
    brand: v.brand,
    name: v.name,
    price: v.price,
    startDate: v.start,
    endDate: v.end,
    quantity: 1,
    spec: JSON.parse(v.style_select),
    specData: JSON.parse(v.spec),
  }))
  return res.json({ message: 'authorized', cartR })
})
// 新增商品
router.post('/addrent', authenticate, async (req, res) => {
  const { rows } = await executeQuery(
    `SELECT spec,rent_id,id FROM cart_rent WHERE user_id = ${req.user.id}`
  )

  for (const v of rows) {
    if (
      JSON.stringify(JSON.parse(v.spec)) ===
        JSON.stringify(req.body.specData) &&
      v.rent_id === req.body.id
    ) {
      const spec = JSON.stringify(req.body.specData)
      const newDateSql = `UPDATE cart_rent SET start = '${req.body.startDate}' , end = '${req.body.endDate}' WHERE rent_id = ${v.rent_id} AND spec = '${spec}'`
      await pool.execute(newDateSql)
      return res.json({
        message: 'success',
        code: '201',
      })
    }
  }

  const newSpec = JSON.stringify(req.body.specData)
  const newSql = `INSERT INTO cart_rent (user_id, rent_id, spec,start,end,is_checked)
    VALUES (${req.user.id}, ${req.body.id}, '${newSpec}','${req.body.startDate}','${req.body.endDate}',0);`
  await pool.execute(newSql)
  return res.json({ message: 'authorized', code: '200' })
})
// 起始日期更改
router.post('/rentdate', authenticate, async (req, res) => {
  const { rows } = await executeQuery(
    `SELECT spec,rent_id,id FROM cart_rent WHERE user_id = ${req.user.id}`
  )

  for (const v of rows) {
    if (
      JSON.stringify(JSON.parse(v.spec)) === req.body.specData &&
      v.rent_id === req.body.id
    ) {
      const newDateSql = `UPDATE cart_rent SET start = '${req.body.startDate}' , end = '${req.body.endDate}' WHERE id = ${v.id}`
      await pool.execute(newDateSql)
      return res.json({
        message: 'success',
        code: '201',
      })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 刪除購物車
router.post('/deleterent', authenticate, async (req, res) => {
  const firstSql = `SELECT id,spec FROM cart_rent WHERE user_id = ${req.user.id} AND rent_id = ${req.body.id}`
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const deleteSql = `DELETE FROM cart_rent WHERE id = ${v.id}`
      await pool.execute(deleteSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 勾選
router.post('/checkrent', authenticate, async (req, res) => {
  const firstSql = `SELECT id,is_checked,spec FROM cart_rent WHERE user_id = ${req.user.id} AND rent_id = ${req.body.id}`
  const { rows } = await executeQuery(firstSql)
  for (const v of rows) {
    if (JSON.stringify(JSON.parse(v.spec)) === req.body.specData) {
      const updateSql = `UPDATE cart_rent SET is_checked = ${!v.is_checked} WHERE id = ${
        v.id
      }`

      await pool.execute(updateSql)

      return res.json({ message: 'success', code: '200' })
    }
  }

  return res.json({ message: 'success', code: '400' })
})
// 勾選全部
router.post('/checkallrent', authenticate, async (req, res) => {
  const check = req.body.checkAll ? 1 : 0
  const updateSql = `UPDATE cart_rent SET is_checked = ${check} WHERE user_id = ${req.user.id}`

  // console.log(updateSql)
  await pool.execute(updateSql)

  return res.json({ message: 'success', code: '200' })
})

export default router
