require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get("/api/persons", (request, response) => {
  Person.find({}).then(people => {
    people.forEach(person => console.log(person.name))
    response.json(people)
  })
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    response.json(person)
  })
  .catch(error => next(error))
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
  

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    console.log(result)
    response.status(204).end()
  })
  .catch(error => next(error))
  // const id = Number(request.params.id)

  // const prevLength = persons.length
  // persons = persons.filter(person => person.id !== id)
  // const currLength = persons.length

  // if (prevLength > currLength) {
  //   response.status(204).end()
  // } else {
  //   response.status(404).end()
  // }

})

app.post("/api/persons", async (request, response) => {
  const body = await request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: "name or number missing"
    })
  }
  const nameAlreadyTaken = await Person.find({}).then(people => people.find(person => person.name === body.name))
  if (nameAlreadyTaken) {
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') return response.status(400).send({ error: 'malformatted id' })
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})