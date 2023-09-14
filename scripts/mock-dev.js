const express = require('express');

const mockServer = require('../mock/mock-server');

const app = express();
mockServer(app);

app.listen(3001);
