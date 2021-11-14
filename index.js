require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get("/api/persons", (request, response) => {
  Person.find({}).then(people => {
    people.forEach(person => console.log(person.name))
    response.json(people)
  })
})

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
  .then(person => {
    response.json(person)
  })
  .catch(error => {
    response.status(404).end()
  })
})

app.get("/info", (request, response) => {
  Person.find({})
  .then(persons => {
    const people = `<p>Phonebook has info for ${persons.length} people</p>`
    const date = `<p>${new Date()}</p>`
    response.send(people + date)
  })
  .catch(error => {
    response.status(404).end()
  })
})
  

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)

  const prevLength = persons.length
  persons = persons.filter(person => person.id !== id)
  const currLength = persons.length

  if (prevLength > currLength) {
    response.status(204).end()
  } else {
    response.status(404).end()
  }

})

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: "name or number missing"
    })
  } else if (Person.find({}).then(people => people.find(person => person.name === body.name))) {
    return response.status(400).json({ 
      error: "name must be unique"
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => response.json(savedPerson))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})