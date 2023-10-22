import express from 'express'
const router = express.Router()
import { createOtp, updatePassword } from '../models/otp.js'
import transporter from '../config/mail.js'
import 'dotenv/config.js'

// 電子郵件文字訊息樣版

const mailHtml = (otpToken) => `
<html>
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700;800;900&family=Poppins&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: 'poppins', 'Noto Sans', 'Noto Sans TC Regular', Helvetica,
          Arial, 'PingFang TC', '苹方-繁', 'Heiti TC', '黑體-繁',
          'Microsoft JhengHei', '微軟正黑體', system-ui, -apple-system,
          'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
          'Liberation Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol', 'Noto Color Emoji';
        font-size: 16px;
        line-height: 1.5;
        box-sizing: border-box;
      }

      .mail-wrapper {
        background-color: rgb(240, 240, 240);
        padding: 30px 0;
        width: 100%;
        color: #171717;
      }

      .mail-card {
        margin: auto;
        padding: 20px;
        background-color: white;
        border: 20px solid #dc942975;
        width: 70%;
      }

      .title {
        font-weight: 900;
        font-size: 28px;
      }

      .content {
        padding: 5px;
        margin-block: 10px;
        border: 1px solid gray;
      }

      .token-content {
        background-color: #dc9429;
        color: white;
        padding-block: 10px;
      }

      .tip {
        text-align: center;
        font-size: 20px;
        font-weight: 900;
      }

      .token {
        text-align: center;
        font-size: 30px;
        font-weight: 900;
      }

      .column {
        width: 100%;
      }

      .img-wrapper img {
        display: block;
        margin: auto;
        width: 50%;
        max-width: 300px;
      }
    </style>
  </head>

  <body>
    <div class="mail-wrapper">
      <div class="mail-card">
        <h2 class="title">親愛的 鍵之旅人 會員您好：</h2>

        <p class="content">
          通知重設密碼所需要的驗證碼，<br />
          將以下6位驗證碼輸入於：<br />
          重設密碼頁面的《電子郵件驗證碼》欄位中。<br />
          <br />
          請注意驗證碼將於寄送後 30 分鐘後過期，<br />
          如有任何問題請洽 鍵之旅人 客服人員
          <br />
          <br />
          <a href="mailto:ispankeytraveler@gmail.com"
            >聯絡客服人員 ispankeytraveler@gmail.com</a
          >
        </p>

        <div class="token-content">
          <div class="column">
            <div class="tip">請輸入以下的6位數字：</div>
            <div class="token">${otpToken}</div>
          </div>
        </div>

        <h2>敬上</h2>
        <h2>Key Traveler 鍵之旅人</h2>
        <div class="img-wrapper">
          <img
            src="https://i.imgur.com/GvIWCUj.png"
            alt="Key Traveler Logo"
          />
        </div>
      </div>
    </div>
  </body>
</html>
`

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
    from: `"鍵之旅人"<${process.env.SMTP_TO_EMAIL}>`,
    to: email,
    subject: '重設密碼要求的電子郵件驗証碼',
    html: mailHtml(otp.token),
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
