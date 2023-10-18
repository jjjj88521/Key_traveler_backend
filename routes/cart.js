import express from 'express'
const router = express.Router()
import authenticate from '../middlewares/jwt.js'
import { executeQuery } from '../models/base.js'
import pool from '../config/db.js'

// router.post("/")
router.get('/product', authenticate, async (req, res) => {
  const test = 'cart_test_authenticate'
  console.log(test.bgCyan)
  console.log(req)
  console.log(req.body.specData)
  const sqlPd = `SELECT product.name, product.images, product.price, cart.is_checked, cart.amount, cart.spec, product.id, product.brand, product.style_select
  FROM cart
  INNER JOIN product ON cart.product_id = product.id;`

  const testsql = `SELECT
  c.user_id,
  c.product_id,
  c.spec,
  p.id AS product_id,
  p.name AS product_name,
  p.images AS product_images,
  p.price AS product_price
FROM cart c
INNER JOIN (
  SELECT user_id, product_id
  FROM cart
  GROUP BY user_id, product_id
  HAVING COUNT(*) > 1
) subquery
ON c.user_id = subquery.user_id AND c.product_id = subquery.product_id
INNER JOIN product p
ON c.product_id = p.id`
  const { rows } = await executeQuery(sqlPd)
  //   console.log('rows')
  //   console.log(rows)

  const cart = rows.map((v) => ({
    id: v.id,
    check: v.is_checked,
    img: '/images/' + JSON.parse(v.images)[0],
    brand: v.brand,
    name: v.name,
    price: v.price,
    quantity: v.amount,
    spec: JSON.parse(v.style_select),
    specData: JSON.parse(v.spec),
  }))
  console.log('cart')
  console.log(cart)
  //   const image = JSON.parse(data)
  // return res.json({ message: 'authorized', rows, user })
  return res.json({ message: 'authorized', cart })
})
router.post('/addproduct', authenticate, async (req, res) => {
  const test = 'cart_post_authenticate'
  console.log(test.bgCyan)
  console.log(req.user.id)
  console.log(req.body.id)
  console.log(req.body.specData)

  const { rows } = await executeQuery(`SELECT spec,product_id FROM cart`)

  for (const v of rows) {
    if (
      JSON.stringify(JSON.parse(v.spec)) ===
        JSON.stringify(req.body.specData) &&
      v.product_id === req.body.id
    ) {
      const updateSql = `UPDATE cart
        SET amount = amount + ${req.body.quantity}
        WHERE user_id = ${req.user.id} AND product_id = ${req.body.id}`
      console.log(updateSql)
      const [result, fields] = await pool.execute(updateSql)
      console.log(result)
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
  console.log(newSpec)
  const newSql = `INSERT INTO cart (user_id, product_id, amount,spec,is_checked)
  VALUES (${req.user.id}, ${req.body.id},${req.body.quantity}, '${newSpec}',0);`
  //   console.log(newSql)
  await pool.execute(newSql)
  //   const [result1, fields1] = await pool.execute(newSql)
  //   console.log(result1)
  return res.json({ message: 'authorized', code: '200' })
})

export default router
