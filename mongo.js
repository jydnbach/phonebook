const mongoose = require('mongoose');

const password = process.argv[2];
const url = `mongodb+srv://jydndev:${password}@cluster0.t2jkd.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`;

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose.connect(url);
console.log('connected');

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  const newPerson = new Person({ name, number });

  newPerson.save().then(() => {
    console.log(`added ${name} ${number} to phonebook`);
    mongoose.connection.close();
  });
}

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook: ');
    result.forEach((person) => {
      console.log(person);
    });

    mongoose.connection.close();
  });
}
