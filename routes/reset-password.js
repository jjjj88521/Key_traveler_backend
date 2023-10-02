import express from 'express'
const router = express.Router()
import { createOtp, updatePassword } from '../models/otp.js'
import transporter from '../config/mail.js'
import 'dotenv/config.js'

// 電子郵件文字訊息樣版
const mailText = (otpToken) => `親愛的 鍵之旅人 會員 您好，
通知重設密碼所需要的驗証碼，
請輸入以下的6位數字，重設密碼頁面的"電子郵件驗証碼"欄位中。
請注意驗證碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員:
    
${otpToken}
    
敬上

鍵之旅人`

// create otp
router.post('/otp', async (req, res, next) => {
  const { email } = req.body

  if (!email) return res.json({ message: 'fail', code: '400' })

  // 建立otp資料表記錄，成功回傳otp記錄物件，失敗為空物件{}
  const otp = await createOtp(email)

  if (!otp.token) return res.json({ message: 'fail', code: '400' })

  // 寄送email
  const mailOptions = {
    // 這裡要改寄送人名稱，email在.env檔中代入
    from: `"support"<${process.env.SMTP_TO_EMAIL}>`,
    to: email,
    subject: '重設密碼要求的電子郵件驗証碼',
    text: mailText(otp.token),
  }

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      // 失敗處理
      return res.status(400).json({ message: 'fail', detail: err })
    } else {
      // 成功回覆的json
      return res.json({ message: 'email sent', code: '200' })
    }
  })
})

// 重設密碼用
router.post('/reset', async (req, res, next) => {
  const { email, token, password } = req.body

  if (!token) return res.json({ message: 'fail', code: '400' })

  // updatePassword中會驗証otp的存在與合法性(是否有到期)
  const result = await updatePassword(email, token, password)

  if (!result) return res.json({ message: 'fail', code: '400' })

  return res.json({ message: 'success', code: '200' })
})

export default router
