import { readJsonFile, writeJsonFile } from './json-tool.js'
import {
  createTable,
  insertMany,
  insertOne,
  cleanTable,
} from '../models/base.js'
// eslint-disable-next-line
import { fakerZH_TW as faker } from '@faker-js/faker'

// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'

// 讓console.log可以呈現檔案與行號
import { extendLog, toKebabCase } from './tool.js'
extendLog() // 執行全域套用
// console.log呈現顏色用 全域套用
import 'colors'

const catOptions = [
  {
    id: 1,
    name: '衣服',
  },
  {
    id: 2,
    name: '鞋子',
  },
  {
    id: 3,
    name: '配件',
  },
  {
    id: 4,
    name: '帽子',
  },
  {
    id: 5,
    name: '其它',
  },
]

const tagOptions = [
  {
    id: 1,
    name: '男性',
  },
  {
    id: 2,
    name: '女性',
  },
  {
    id: 3,
    name: '中性',
  },
  {
    id: 4,
    name: '兒童',
  },
]

const colorOptions = [
  {
    id: 1,
    name: '黑',
  },
  {
    id: 2,
    name: '白',
  },
  {
    id: 3,
    name: '紅',
  },
  {
    id: 4,
    name: '綠',
  },
  {
    id: 5,
    name: '黃',
  },
]

const sizeOptions = [
  {
    id: 1,
    name: 'S',
  },
  {
    id: 2,
    name: 'M',
  },
  {
    id: 3,
    name: 'L',
  },
  {
    id: 4,
    name: 'XL',
  },
]

function creatFakeUser() {
  return {
    userId: faker.string.uuid(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    username: faker.internet.userName(),
    sex: faker.person.sex(),
    city: faker.location.city(),
    address: faker.location.streetAddress(true),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birth_date: faker.date.birthdate(),
    register_date: faker.date.past(),
    bio: faker.person.bio(),
  }
}

function createFakeProduct() {
  const productTypes = [
    '運動鞋',
    '跑步鞋',
    '籃球鞋',
    '瑜珈鞋',
    '瑜珈墊',
    '瑜珈衣',
    '排汗衣',
    '短袖上衣',
    '短褲',
    '長褲',
    '長袖上衣',
    '背心',
  ]
  const name =
    faker.commerce.productName() + faker.string.fromCharacters(productTypes)
  const slug = toKebabCase(name)
  const price = faker.number.int({ min: 15, max: 100 }) * 100
  const imgs = Array(3)
    .fill(1)
    .map((v, i) => faker.image.url())
  const teaser = imgs[0]

  const stock = faker.number.int({ min: 1, max: 10 }) * 10

  return {
    sn: faker.string.uuid(),
    name,
    slug,
    teaser,
    imgs,
    stock,
    price,
    info: faker.commerce.productDescription(),
    cat_id: faker.number.int({ min: 1, max: 5 }),
    color: faker.helpers.arrayElements([1, 2, 3, 4, 5], { min: 1, max: 5 }),
    tag: faker.helpers.arrayElements([1, 2, 3, 4], {
      min: 1,
      max: 3,
    }),
    size: faker.helpers.arrayElements([1, 2, 3, 4], {
      min: 1,
      max: 4,
    }),
  }
}

const createProducts = async (num, reset = true, productStartId = 0) => {
  const products = Array(num)
    .fill(1)
    .map((v, i) => {
      return { id: i + 1 + productStartId, ...createFakeProduct() }
    })

  //await writeJsonFile('./data/json/fake-product.json', products)

  // use create table will drop first default
  if (reset) {
    await createTable('product', products[0])
    await createTable('product_color', { id: 1, pid: 1, color_id: 1 })
    await createTable('product_tag', { id: 1, pid: 1, tag_id: 1 })
    await createTable('product_size', { id: 1, pid: 1, size_id: 1 })

    await createTable('category', catOptions[0])
    await createTable('size', sizeOptions[0])
    await createTable('color', colorOptions[0])
    await createTable('tag', tagOptions[0])

    await insertMany('category', catOptions)
    await insertMany('size', sizeOptions)
    await insertMany('color', colorOptions)
    await insertMany('tag', tagOptions)
  }

  await insertMany('product', products)

  const product_color = []
  const product_tag = []
  const product_size = []

  for (const product of products) {
    for (const color_id of product.color) {
      product_color.push({ pid: product.id, color_id })
    }

    for (const tag_id of product.tag) {
      product_tag.push({ pid: product.id, tag_id })
    }

    for (const size_id of product.size) {
      product_size.push({ pid: product.id, size_id })
    }
  }

  await insertMany('product_color', product_color)
  await insertMany('product_tag', product_tag)
  await insertMany('product_size', product_size)
}

// 產生1k資料
createProducts(1000)
