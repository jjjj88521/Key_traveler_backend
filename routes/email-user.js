import express from 'express'
import transporter from '../config/mail.js'
import 'dotenv/config.js'

const router = express.Router()

const mailHtml = (content) => {
  content = content.replace(/\r\n/g, '<br>')
  return `
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
            ${content}
            <br/>
            如有任何問題請洽 鍵之旅人 客服人員
            <br />
            <br />
            <a href="mailto:ispankeytraveler@gmail.com"
              >聯絡客服人員 ispankeytraveler@gmail.com</a
            >
          </p>
  
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
}

/* 寄送email的路由 */
router.post('/send', function (req, res, next) {
  const email = req.body.email
  console.log(email)
  const mailContent =
    '歡迎加入鍵之旅人的行列。我們非常高興您選擇了我們的服務。\r\n感謝您的支持!\r\n祝您有個愉快的指尖旅程!\r\n'
  // email內容
  const mailOptions = {
    from: `"鍵之旅人"<${process.env.SMTP_TO_EMAIL}>`,
    to: `${email}`,
    subject: '歡迎註冊 鍵之旅人',
    html: mailHtml(mailContent),
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
