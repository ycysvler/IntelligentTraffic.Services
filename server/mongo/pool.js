let dbSchemas = require('./dbschemas');
let configSchemas = require('./configschemas');
let analysisSchemas = require('./analysisschemas');

const pool = new Map();

let getMongoPool = (date) => {
    if (!pool.has(date)) {
        if(date === 'analysis'){
            let schemas = new analysisSchemas();
            pool.set(date, schemas);
        }else if(date === 'config'){
            let schemas = new configSchemas();
            pool.set(date, schemas);
        }else{
            let schemas = new dbSchemas(date);
            pool.set(date, schemas);
        }
    }
    let db = pool.get(date);
    return db;
}

module.exports = getMongoPool;