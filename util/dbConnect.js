// util/dbConnect.js
require('dotenv').config();
const mongoose = require('mongoose');

const { MONGO_ATLAS, MONGO_LOCAL, NODE_ENV } = process.env;
const MONGO_URI = NODE_ENV === 'development' ? MONGO_LOCAL : MONGO_ATLAS;

if (!MONGO_URI) {
    throw new Error(
        '❌ Neither MONGO_LOCAL nor MONGO_ATLAS is set in your .env file'
    );
}

mongoose.connection.once('open', () => {
    console.log('✨ MongoDB connection established');
});

mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
});

/**
 * Call this to connect. Returns a Promise.
 */
function dbConnect() {
    return mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = dbConnect;
