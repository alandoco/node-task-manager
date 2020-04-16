const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try{
        //Getting token from header and removing Bearer string
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //This finds a user using the id from the decoded token
        //And also searches that users token array(tokens.token)
        //to check if it exists
        console.log(token)
        console.log(decoded)
        const user = await User.findOne({
            _id: decoded._id, 
            'tokens.token': token
        })

        console.log(user)

        if(!user){
            //This triggers the catch
            throw new Error()
        }

        //This passes the user document into the request so it
        //can be used in the route handler
        //Avoids the route handler having to re-fetch the user
        req.user = user
        req.token = token
        next()
    } catch(e){
        res.status(401).send({error: 'Please authenticate'})
    }
}

module.exports = auth