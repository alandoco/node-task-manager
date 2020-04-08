const express = require('express')
const User = require('../models/user')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch(e) {
        res.status(400).send(e)
    }

})

router.get('/users', async (req, res) => {

    try {
        const users = await User.find({})
        res.send(users)
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {

    try{
        const user = await User.findById(req.params.id)

        if(!user){
            return res.status(404).send()
        }
        
        res.send(user)
    } catch(e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', async (req, res) => {
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
        //new: true returns the updated user
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, })
        if(!user){
            return res.status(404).send()
        }

        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res) => {

    try {
        const user = await User.findByIdAndDelete(req.params.id)
        
        if(!user){
            return res.status(404).send()
        }
        
        res.send(user)
    } catch(e) {
        res.status(500).send()
    }
})


module.exports = router