import express from 'express'
import transporter from '../config/mail.js'
import 'dotenv/config.js'

const router = express.Router()

/* 寄送email的路由 */
router.post('/send', function (req, res, next) {
  const email = req.body.email
  console.log(email)
  // email內容
  const mailOptions = {
    from: `"key-traveler"<${process.env.SMTP_TO_EMAIL}>`,
    to: `${email}`,
    subject: '歡迎註冊 鍵之旅人',
    text: `親愛的用戶，\r\n\r\n歡迎加入鍵之旅人的行列。我們非常高興您選擇了我們的服務。\r\n感謝您的支持，如果您有任何問題或需要幫助，請隨時聯絡我們。\r\n\r\n敬上\r\n鍵之旅人`,
  }

  // 寄送
  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      // 失敗處理
      return res.status(400).json({ message: 'Failure', detail: err })
    } else {
      // 成功回覆的json
      return res.json({ message: 'Success' })
    }
  })
})

export default router
