require('dotenv').config();
const express = require('express');
const app = express();

const connectDB = require('./database/db'); // connect to DB

(async () => {
    await connectDB();
    app.use(express.json());

    app.get('/', (req, res) => res.send('Hello world'));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();
