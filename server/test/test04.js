let moment = require('moment');

let begin =  new moment('2015-05-01');
let end =  new moment('2015-06-12');

let days = [];

while(begin <= end){
    days.push(begin.format('YYYYMMDD'));

    begin = begin.add(1,'days');

    console.log('begin\tend', begin,end);
}

console.log('days', days);