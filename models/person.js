const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;
console.log(`connecting to`, url);

mongoose
  .connect(url)
  .then((data) => console.log(`connected to MongoDB`))
  .catch((err) => console.log(`failed to connect to MongoDB`, err.message));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  number: {
    type: String,
    require: true,
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
