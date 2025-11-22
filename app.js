require('dotenv').config();
const express = require('express');
const app = express();

require('./database/db'); // connect to DB

app.use(express.json());

app.get('/', (req, res) => res.send('Hello world'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
