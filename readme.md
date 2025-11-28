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

So, in the package.json, we can add another script to run a new devServer.js, and make it listen on another port
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
***************************************************************************************
***************************************************************************************
***************************************************************************************
***************************************************************************************