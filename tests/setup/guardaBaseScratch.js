require('dotenv').config();

const { verificarUriScratch } = require('./verificarUriScratch');

verificarUriScratch(process.env.MONGODB_URI);
