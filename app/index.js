'use strict';

const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.end('working');
});

app.listen(process.env.PORT);
