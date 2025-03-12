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

// fetch
app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
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

  person.save().then((data) => res.json(data));
});

// delete
app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(() => res.status(204).end());
});

// app.get('/info', (req, res) => {
//   const reqDate = new Date().toDateString();
//   const reqTime = new Date().toLocaleTimeString();

//   res.send(`
//     Phonebook has info for ${persons.length} people
//     ${reqDate} ${reqTime}
//     `);
// });

// // fetching single set of data
// app.get('/api/persons/:id', (req, res) => {
//   const id = req.params.id;
//   const person = persons.find((person) => person.id === id);

//   if (person) {
//     res.json(person);
//   } else {
//     res.status(404).end();
//   }
// });

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
