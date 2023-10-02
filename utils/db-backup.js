// const fs = require('fs')
// const path = require('path')
// const spawn = require('child_process').spawn
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const folder = './backup'
const config = { user: 'test_db', password: '123456', database: 'test_db' }

const date = new Date()
const dumpFileName = `${date.getFullYear()}${
  date.getMonth() + 1
}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}.dump.sql`

const filePath = path.join(process.cwd(), `${folder}/` + dumpFileName)

const writeStream = fs.createWriteStream(filePath)

const dump = spawn('mysqldump', [
  '-u',
  config.user,
  `-p${config.password}`,
  config.database,
])

dump.stdout
  .pipe(writeStream)
  .on('finish', function () {
    console.log('Completed')
  })
  .on('error', function (err) {
    console.log(err)
  })
