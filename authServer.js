const express = require('express')
const app = express();
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

app.use(express.json())


let refreshTokens = []

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'});
}

app.post('/token', (req, res) => {
        const refreshToken = req.body.token
        if(refreshToken == null) return res.sendStatus(401)
        if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            const accessToken = generateAccessToken({ name: user.name })
            res.json({ accessToken: accessToken})
    })
})


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

    // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

    // to use refresh token, we will call a generateAccessToken function which generates a token 
    // with an expiry date which can then be refreshed with a refresh token
    
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)

    // last thing to do is ti return this refreshToken to our user
    res.json({accessToken: accessToken, refreshToken: refreshToken })

})

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.refreshToken
    refreshTokens = refreshTokens.filter(token => token !== refreshToken)
    res.sendStatus(204)
})

app.listen(4000)