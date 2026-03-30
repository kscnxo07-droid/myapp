const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use(require('./routes/interaction'))
app.use(require('./routes/cds-hooks'))

app.get('/', (req, res) => res.send('後端已啟動！'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`伺服器運行於 http://localhost:${PORT}`))