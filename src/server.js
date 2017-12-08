import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import socketio from 'socket.io'
import fs from 'fs'
import mime from 'mime'

const app = express()
const router = express.Router()
const port = 80

let currentColor = "FFFF00"

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(compression())
app.use(morgan('common'))
app.use(express.static(__dirname + '/src/public'))

app.get('/currentBG', (req, res, next) => {
    res.json({
        'background-color': currentColor
    })
})

router.get(/index.html$/, function(req, res, next) {
    res.sendFile(__dirname + '/public/static/index.html')
})

router.get(/static/, function(req, res, next){
    let pathname = req._parsedUrl.pathname
    let localPath = __dirname + '/public' +  pathname.substring(pathname.search('/public/static'))
    console.log(localPath)
    fs.readFile(localPath, (err, data) => {
        if(err) res.status(404).json({
            error: {
                messages: 'File not found!'
            }
        }) 
        else {
            let type = mime.getType(localPath)
            res.setHeader('Content-Type', type)
            res.sendFile(localPath)
        }
    })
})

router.get('*', (req, res, next) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.use('/', router)

const server = app.listen(port, function(){
    console.log(`Starting Chat server at port ${port}`)
})

const io = socketio.listen(server)

io
  .of('/currentBG')
  .on('connection', (socket) => {
      socket.on('change', data => {
          currentColor = data.color
          io.of('/currentBG').emit('change', {
              color: currentColor
          })
          console.log("Color changed to #" + currentColor)
      })
  })