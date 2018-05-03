let gm = require('gm').subClass({imageMagick:true});

let getMongoPool = require('../mongo/pool');

gm('./image.jpg').size((err,size)=>{

    console.log(size);
})

// gm("./image.jpg").crop(300, 300, 10, 10).write('./i1.jpg',(err)=>{
//     console.log(err);
// })

gm("./image.jpg").crop(300, 300, 10, 10)
    .stroke("black", 3)
    .fill('transparent')
    .drawRectangle(10, 10, 150, 150)
    .write('./i2.jpg',(err)=>{
    console.log(err);

})

let date = '20180501';
let name = 'image3.jpg';

let ImageSource = getMongoPool(date).ImageSource;

ImageSource.findOne({name: name}, 'source', function (err, item) {
    if (err) {

    } else {
        gm(item.source).crop(300, 300, 10, 10)
            .stroke("black", 3)
            .fill('transparent')
            .drawRectangle(10, 10, 150, 150)
            .write('./i2.jpg',(err)=>{
                console.log(err);

            })
    }
});