let dbSchemas = require('./dbschemas');

const pool = new Map();

let getMongoPool = (date) => {
    if (!pool.has(date)) {
        let schemas = new dbSchemas(date);
        pool.set(date, schemas);
    }
    let db = pool.get(date);
    return db;
}

module.exports = getMongoPool;