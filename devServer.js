const express = require('express')
const app = express();
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

app.use(express.json())



const posts = [
    {
        username: 'kyle',
        title: 'Post 1'
    },
    {
        username: 'Wale',
        title: 'Post 2'
    }
]

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return res.sendStatus(401)

    //now we have gotten the token, we cna jsut use jwt.verify to verify the token.
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })

}

//we need now to import the jwt.
app.post('/login', (req, res) => {
    //Authenticate user

    const username = req.body.username

    const user = { name: username }

    // what happens is that a user logs in, and we get their username after the successful login
    // then we call jwt to sign their user for us with a token that we will generate using crypto
    // the jwt wants to serealise the user object
    // the jwt token takes two parameter: jwt.sign(payload, secretOrPrivateKey). The second key
    // is our ACCESS_TOKEN_SECRET which will we will have already stored in our .env
    // The return value from the jwt.sign is our accessToken. So we can send it as a response.

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({accessToken: accessToken })

})

app.get('/',(req, res) => {
    res.send("hello world")
})

app.get('/posts', authenticateToken, (req, res) => {

    res.json(posts.filter(posts => posts.username === req.user.name))
})

app.listen(4000)