const express = require('express')

let app = express();

app.get('/*', (req, res) => {
    console.log('hello')
    res.send('hello world')
})

app.listen(3000, () => {
    console.log('listening port at 3000')
})