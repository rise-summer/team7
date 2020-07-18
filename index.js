'use strict';

const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.end('hello world. nyaa');
});

app.listen(process.env.PORT);
