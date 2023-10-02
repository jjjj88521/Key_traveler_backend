import nodemailer from 'nodemailer'
// 導入dotenv 使用 .env 檔案中的設定值 process.env
import 'dotenv/config.js'

let transport = null

// 定義所有email的寄送伺服器位置
transport = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  //在專案的 .env 檔案中定義關於寄送郵件的 process.env 變數
  auth: {
    user: process.env.SMTP_TO_EMAIL,
    pass: process.env.SMTP_TO_PASSWORD,
  },
}

// 呼叫transport函式
const transporter = nodemailer.createTransport(transport)

// 驗証連線設定
transporter.verify((error, success) => {
  if (error) {
    // 發生錯誤
    console.error(error)
  } else {
    // 代表成功
    console.log('SMTP Server Connected. Ready to send mail!'.bgGreen)
  }
})

export default transporter
