const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alanrochford19@gmail.com',
        subject: 'Thanks for Joining Us',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'alanrochford19@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}. Is there anything we could have done to keep you around`
    })
}

module.exports = {sendWelcomeEmail, sendCancellationEmail}