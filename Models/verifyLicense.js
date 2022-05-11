const mongoose=require('mongoose')

const licenseSchema = new mongoose.Schema({
    licenseKey:[String]
})


const licenseModel = new mongoose.model('License', licenseSchema)

module.exports = licenseModel