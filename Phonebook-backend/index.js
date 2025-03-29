/* eslint-disable no-undef */
require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const PhoneBook = require('./models/phoneBook')

app.use(express.static('build'))
app.use(cors())
app.use(morgan('tiny'))
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(express.json())
// app.use(express.static('build'))

const morganPost = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms', JSON.stringify(req.body)
  ].join(' ')
})

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

app.get('/api/persons', (request, response) => {
  console.log('chegou aqui 53')
  PhoneBook.find({}).then(persons => {
    response.json(persons)
  })
})

// app.get('/api/persons', (request, response) => {
//   response.json(persons)
// })

app.get('/info', (request, response) => {
  response.send('<h3>Phonebook has info for ' + persons.length + ' people </h3><h3>' + new Date() + '</h3>')
})

app.get('/api/persons/:id', (request, response, next) => {
  PhoneBook.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  PhoneBook.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const phoneBook = {
    name: body.name,
    number: body.number,
  }

  PhoneBook.findByIdAndUpdate(request.params.id, phoneBook, { new: true })
    .then(updatedPhoneBook => {
      response.json(updatedPhoneBook)
    })
    .catch(error => next(error))
})


app.post('/api/persons', morganPost, (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  PhoneBook.find({ name: body.name }).exec().then(result => {
    if (result.length > 0) {
      PhoneBook.updateOne({ name: body.name }, { name: body.name, number: body.number }).then(result => {
        response.json(result)
      })
    } else {
      const phoneBook = new PhoneBook({
        name: body.name,
        number: body.number,
      })
      phoneBook.save().then(savedPhoneBook => {
        response.json(savedPhoneBook)
      })
    }
  });
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)



// const PORT = 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
