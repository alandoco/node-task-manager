const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()

        res.status(201).send({user,token})
    } catch(e) {
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({user, token})

    } catch(e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        //Loops through tokens array
        //returns true when a token doesn't matcht the token set in auth()
        //If it returns false, that token is excluded from the array
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        //saves the user to db
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    }

    catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    //Sending back user profile. This was added to req
    //in auth.js
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    //Gets the keys from request body
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    //every() loops through updates array 
    //and checks return value for each (true or false)
    //The function only returns true if every return value is true within the function
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    //We're doing this because we will get at 200 if
    //we add in a new field in the update body
    //even though the field won't be added to DB
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid Updates"})
    }

    try {
        updates.forEach((update) => {
            //Using sq brackets rather than .
            //as we need to access dynamic update variable
            req.user[update] = req.body[update]
        })

        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        //Remove is a mongoose method to remove a document 
        await req.user.remove()
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})

const FILE_SIZE_LIMIT = 1000000
const upload = multer({
    limits: {
        fileSize: FILE_SIZE_LIMIT //1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Upload Failed. File must be a jpg, jpeg or png'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error() 
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})


module.exports = router