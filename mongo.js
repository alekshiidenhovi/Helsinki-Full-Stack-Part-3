const mongoose = require('mongoose')

if (process.argv.length !== 5 && process.argv.length !== 3) {
  console.log(
    'To provide a new entry to database, enter: node mongo.js <password> <name> <number>\n' + 
    'To show entries in the database, enter: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.pdrtx.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const generateID = () => Math.trunc(Math.random() * 10000000)

const person = new Person({
  id: generateID(),
  name: name,
  number: number
})

if (process.argv.length === 5) { // push a new entry to the database
  person.save().then(result => {
    console.log(`Added ${name} number ${number} to phonebook!`)
    mongoose.connection.close()
  })
} else { // show all the entries in the database
  console.log(`Phonebook:`)
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
