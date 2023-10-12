// models/cart.js

import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database' // 导入数据库配置

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spec: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_check: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'cart',
    tableName: 'carts', // 数据表名
  }
)

export default Cart
