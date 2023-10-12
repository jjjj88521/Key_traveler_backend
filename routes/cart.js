import express from 'express'
const router = express.Router()

import Cart from '../models/cart.js' // 导入购物车数据模型

// 添加商品到购物车
router.post('/add-to-cart', (req, res) => {
  const { user_id, product_id, amount, spec, is_check } = req.body

  // 在数据库中创建购物车记录
  Cart.create({
    user_id,
    product_id,
    amount,
    spec,
    is_check,
  })
    .then((cartItem) => {
      res.status(201).json(cartItem)
    })
    .catch((error) => {
      res.status(500).json({ error: '无法添加商品到购物车' })
    })
})

// 获取用户的购物车
router.get('/user-cart/:user_id', (req, res) => {
  const user_id = req.params.user_id

  // 查询特定用户的购物车记录
  Cart.findAll({
    where: { user_id },
  })
    .then((cartItems) => {
      res.status(200).json(cartItems)
    })
    .catch((error) => {
      res.status(500).json({ error: '无法获取购物车' })
    })
})

// 其他购物车操作路由...
// module.exports = router
export default router
