const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){
                throw new Error('Age must be greater than 0')
            }
        }
    },
    password: {
        type: String,
        required:true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps:true //Adds created and modified dates
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, 'thisismynewcourse')
    //Concatenating tokens onto the end of the users tokens array
    user.tokens = user.tokens.concat({token})

    //Saving the user to the database
    await user.save()

    return token
    console.log(token)
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    
    //removing password and tokens from returned object
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)
    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}

//Hash the plain text password before save
userSchema.pre('save', async function (next) {
    const user = this

    //isModified doesn't check whether the value of
    //password has changed, it just checks if a value has been passed in
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    //Next continues and performs the save function
    next()
})

//Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})   
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User