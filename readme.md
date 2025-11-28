## this is the tutorial on how to build secure web application using JWT


Firstly 
```bash
# initially node project
npm init -y

# install the packages we will be using

npm i express jsonwebtoken dotenv
npm i --save-dev nodemon

```

then create your .env file and sever.js file.

you can send request to you server using a .rest file when you install the rest client

So after installing rest.client, then create a request.rest file (or name it anything.rest)

and do 

GET http://localhost:3000/posts
or
POST ...

## sending the requests

and youd be able to send the request to test.

Now, what we want to do is that, we want to protect the post page, so only authenticated users can access the routes. So we will use the JWT process.

after importing the jwt library, we have to let the app be able to use the json

```js
const jwt = require('jsonwebtoken')
app.use(express.json())
```

We also need an ACCESS_TOKEN_SECRET which we can generate using crypto node library 

```bash
> require('crypto').randomBytes(64).toString('hex')
```

so now, let us say we are desinging a login post route,

```js
fastify.post('/login')

```

***************************************************************************************

what happens is that a user logs in, and we get their username after the successful login
then we call jwt to sign their user for us with a token that we will generate using crypto
the jwt wants to serealise the user object
the jwt token takes two parameter: jwt.sign(payload, secretOrPrivateKey). The second key
is our ACCESS_TOKEN_SECRET which will we will have already stored in our .env
The return value from the jwt.sign is our accessToken. So we can send it as a response.
    
    
```js
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

app.get('/posts',(req, res) => {
    res.json(posts)
})

app.listen(3000)

```
***************************************************************************************

Now, that we are able to store the accessToken from JWT, we want to put a middle ware on the post route
which will authenticate the token. i.e check if the token on the userbody is a correct one and can access
the page they are trying to access.

we can do that by having a function, in it what we wan to do is get the token, verify that the user is an
authenticated user, and then send the user into the post route

```JS
function authenticateToken(req, res, next){

}
```

Now this function used to authenticateToken, we can pass it to the post route
```js
app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts)
})
```
***************************************************************************************

so how do we design the authenticate token, 
the authenticateToken function will get the token front he header, which we will refer to as BEARER
so, we will get that token from req.headers('authorization'). 

```JS
function authenticateToken(req, res, next){
    const authHeader = req.headers('authorization')
    const toeken = authHeader && authHeader.split(' ')[1]

    if(token == NULL) return res.sendStatus(401)

    //now we have gotten the token, we cna jsut use jwt.verify to verify the token.
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })

}
```
***************************************************************************************

with this now, we have confirmed that the user truly is authenticated for that route, so we can proceed
to show them the page/resource

```js
app.get('/posts', authenticateToken, (req, res) => {

    res.json(posts.filter(posts => posts.username === req.user.name))
})
```

And this shows the json response for the posts that are only for this user.

***************************************************************************************

Now another powerful use case of JWT authentication is that you can use them across different servers in the app.

So, in the package.json, we can add another script to run a new authServer.js, and make it listen on another port
say, 4000.

so we run it, and we have teo different servers on out web app.

So since we havent changed anything in both servers, we can send the requests from any of the servers and it will still work the same way on any of them

so if we do the login request on port 4000, we can still use the access token to get user data on port 3000

```js
POST http://localhost:4000/login
Content-Type: application/json

{
    "username": "Wale"
}
```

```js
GET http://localhost:3000/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiV2FsZSIsImlhdCI6MTc2NDMwNjk1OH0.1MFbOR4Ol8jXsKs456Cbo6iaOOzOYxBoXzgEQe3jMQk
```

This is something you can do very well when you do session based authentication. So in JWT, the authenticaton is tied to the token, so if you can share the token accross multiple servers, you can use the authentication accross them.

***************************************************************************************

So with that known, we can isolate our authentication on one server, and let other reequests come from other servers. However, we also setup refresh tokens the authentication server handles creating and deleting the refresh tokens.

So we can remove all post routes design and post related codes from the authServer.js file
All will be on that file now will only be our login, logout and refresh totens.

***************************************************************************************

But why do we need refresh tokens?
Since we are now sharing tokens across multiple servers, it is now more vulnerable to attacks, as multiple people may now have acess to it.

So we should set an expiration date to the main tokens, which the refresh tokens will then be used to reissue another token on new request.

So the refresh token is saved in a saved file, and then the normal access token then have an expiry date, which unauthorizes the user, maybe after some minutes, and then the user must use the refresh token to reissue another token. So if someone even has access to your access toekn, they only have access to your account for a few minutes, and then it expires mandating a reissue by the refresh token.

But another issue can be someone stealing the refresh token to reacreate another access token. So that is why the concept of invalidating a refresh token is.
So that is why we create a logout route, that delets the refresh token from the lists of valid refrehs tokens, and invalidates it, so someone else dosent try to use it to access the resource/account.


***************************************************************************************

So lets create a function that creates an access token for us that expires.

so the function generateAccessToken **takes the user object** we want to generate for. 
The code is dsimilar to the access token, but it takes a third argument, i.e the expiry date

```js
function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expires: '15s' })
}
```

we can then use this function in our login route, and after it also design a refreshToken that is signed withe the user

```js

let refreshTokens = []

app.post('/login', (req, res) => {
    const username = req.body.username
    const user = {user: username}

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    refreshTokens.pudh(refreshToken)

    //then return the access and refresh token to the user

    return({accessToken: accessToken, refreshToken: refreshToken});

})
```

***************************************************************************************

Now that we have generated and returned both token to the user, the access token in the post route will work as long as the the expiry, i.e 15s


```js
//remeber that the authenticatToken function is still passed as a middle ware in the post route, so it still get authenticated even if it gets here
app.get('/posts', authenticateToken, (req, res) => {

    res.json(posts.filter(posts => posts.username === req.user.name))
})
```

***************************************************************************************

now, we need to be able to reissue the refreshToken. 
So we can create a route that reissues the access token, using the refreshtoken.
Remeber the refresh token never expires, untill logout. But the access token expires after 15 secs. So if the client comes back to access the result, we quickly reissue another access token by chekcing if their refresh token is valid and usign it to generate another access token.

You want to ask, then where is all the refreshTokens stored.

It is stored in the database.

```js
app.post('token', (req, res) => {
        const refreshToken = req.body.token
        if(refreshToken == null) return res.sendStatus(402)
        if(refreshTokens.includes(refreshToken)) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name})
        res.json({ accessToken: accessToken})
    })
})
```

***************************************************************************************

And finally delete the refresh token on logout

```js
app.delete('/logout', (req, res) => {
    const refreshToken = req.body.refreshToken
    refreshTokens = refreshTokens.filter(token => token !== refreshToken)
    res.sendStatus(204)
})
```
***************************************************************************************