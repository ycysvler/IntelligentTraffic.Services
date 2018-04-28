let gm = require('gm').subClass({imageMagick:true});
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