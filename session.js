const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const { writeClient } = require('./db');

module.exports = () => session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: writeClient,
    dbName: process.env.DB_NAME,
    collectionName: 'sessions',
    autoRemove: 'interval',      // tránh cần quyền createIndex
    autoRemoveInterval: 10
  }),
  cookie: { maxAge: 1000 * 60 * 60, secure: process.env.NODE_ENV === 'production' }
});