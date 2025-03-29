/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://rogerfrancogalt:${password}@helsingfullstackcluster.wdyng.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=HelsingFullstackCluster`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const PhoneBook = mongoose.model('PhoneBook', phoneBookSchema)

const name = process.argv[3]
const number = process.argv[4]

const phoneBook = new PhoneBook({
  name: name,
  number: number,
})

console.log(process.argv.length, 'process.argv.length')
if (process.argv.length === 3) {
  console.log('phonebook:')
  PhoneBook.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}


// Example in the terminal: node mongo.js suasenha Anna 040-1234556
if (process.argv.length > 3) {
  phoneBook.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    console.log(result, 'result')
    mongoose.connection.close()
  })
}
