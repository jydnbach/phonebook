const express = require('express');
const morgan = require('morgan');
const app = express();

require('dotenv').config();

const Person = require('./models/person');

app.use(express.static('dist'));
app.use(express.json());

morgan.token('requestBody', (req, res) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    return JSON.stringify(req.body);
  }
  return '';
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(
  morgan(function (tokens, req, res) {
    return JSON.stringify(
      [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        tokens.requestBody(req, res),
      ].join(' ')
    );
  })
);

// fetch all
app.get('/api/persons', (req, res) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((err) => next(err));
});

// add
app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Name or number missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((data) => res.json(data))
    .catch((err) => next(err));
});

// delete
app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch((err) => next(err));
});

// update
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;
  Person.findByIdAndUpdate(
    req.params.id,
    { number: body.number },
    { new: true }
  )
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((err) => next(err));
});

// fetch individual
app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

// app.get('/info', (req, res) => {
//   const reqDate = new Date().toDateString();
//   const reqTime = new Date().toLocaleTimeString();

//   res.send(`
//     Phonebook has info for ${persons.length} people
//     ${reqDate} ${reqTime}
//     `);
// });

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
