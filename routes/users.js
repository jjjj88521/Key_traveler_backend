import express from 'express'
const router = express.Router()

// 檢查空物件
import { isEmpty } from '../utils/tool.js'

// 認証用middleware(中介軟體)
// import auth from '../middlewares/auth.js'

// 上傳檔案用使用multer(另一方案是使用express-fileupload)
import multer from 'multer'
const upload = multer({ dest: 'public/' })

import {
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
} from '../models/users.js'

// GET - 得到所有會員資料
router.get('/', async function (req, res, next) {
  const users = await getUsers()
  return res.json({ message: 'success', code: '200', users })
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:userId', async function (req, res, next) {
  const user = await getUserById(req.params.userId)
  return res.json({ message: 'success', code: '200', user })
})

// POST - 上傳檔案用，使用express-fileupload
router.post('/upload', async function (req, res, next) {
  // req.files 所有上傳來的檔案
  // req.body 其它的文字欄位資料…
  console.log(req.files, req.body)

  if (req.files) {
    console.log(req.files.avatar) // 上傳來的檔案(欄位名稱為avatar)
    return res.json({ message: 'success', code: '200' })
  } else {
    console.log('沒有上傳檔案')
    return res.json({ message: 'fail', code: '409' })
  }
})

// POST - 上傳檔案用，使用multer
// 注意: 使用nulter會和express-fileupload衝突，所以要先註解掉express-fileupload的使用再作測試
// 在app.js中的app.use(fileUpload())
router.post(
  '/upload2',
  upload.single('avatar'), // 上傳來的檔案(這是單個檔案，欄位名稱為avatar)
  async function (req, res, next) {
    // req.file 即上傳來的檔案(avatar這個檔案)
    // req.body 其它的文字欄位資料…
    console.log(req.file, req.body)

    if (req.file) {
      console.log(req.file)
      return res.json({ message: 'success', code: '200' })
    } else {
      console.log('沒有上傳檔案')
      return res.json({ message: 'fail', code: '409' })
    }
  }
)

// POST - 新增會員資料
router.post('/', async function (req, res, next) {
  // 從react傳來的資料(json格式)，id由資料庫自動產生
  // 資料範例
  // {
  //     "name":"金妮",
  //     "email":"ginny@test.com",
  //     "username":"ginny",
  //     "password":"12345"
  // }

  // user是從瀏覽器來的資料
  const user = req.body

  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (isEmpty(user)) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 這裡可以再檢查從react來的資料，哪些資料為必要(name, username...)
  console.log(user)

  // 先查詢資料庫是否有同username與email的資料
  const count = await getCount({
    username: user.username,
    email: user.email,
  })

  // 檢查使用者是否存在
  if (count) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 新增至資料庫
  const result = await createUser(user)

  // 不存在insertId -> 新增失敗
  if (!result.insertId) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 成功加入資料庫的回應
  return res.json({
    message: 'success',
    code: '200',
    user: { ...user, id: result.insertId },
  })
})

// PUT - 更新會員資料
router.put('/:userId', async function (req, res, next) {
  const userId = req.params.userId
  const user = req.body
  console.log(userId, user)

  // 檢查是否有從網址上得到userId
  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (!userId || isEmpty(user)) {
    return res.json({ message: 'error', code: '400' })
  }

  // 這裡可以再檢查從react來的資料，哪些資料為必要(name, username...)
  console.log(user)

  // 對資料庫執行update
  const result = await updateUserById(user, userId)
  console.log(result)

  // 沒有更新到任何資料
  if (!result.affectedRows) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 最後成功更新
  return res.json({ message: 'success', code: '200' })
})

export default router
