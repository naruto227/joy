/**
 * Created by huang on 16-6-27.
 */
// var Canvas = require('canvas'); //需安装canvas模块
var images = require("images");
var fs = require('fs');
var config = require("../config.js");
var Post = require('../models/post.js');
// var waterMarkimg = new Canvas.Image;
// waterMarkimg.src = config.upload.Imgpath + "waterMark.png";

exports.photo = function (name, user, callback) {
    var charactors = "1234567890";
    var value = '', i;
    for (var j = 1; j <= 4; j++) {
        i = parseInt(10 * Math.random());
        value = value + charactors.charAt(i);
    }
    console.log(value);
    //alert(value);
    //var md5 = crypto.createHash('md5'),
    //imgname = md5.update(req.files.filename.name + String((new Date()).getTime())).digest('hex');
    //imgname = String((new Date()).getTime());
    //imgname = new Date();
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    var imgname = year + '-' + month + '-' + day + '-' + hour + ':' + min + ':' + sec + '-' + value;
    console.log(date);
    var exname = name.name.substring(name.name.lastIndexOf('.') + 1);
    var bigimage = imgname + "." + exname;
    var des_file = config.upload.path + bigimage;
    var smallimage = imgname + '_small' + "." + exname;
    var des_file_s = config.upload.path + smallimage;
    //var des_file_s1 = config.upload.path +'1231'+ smallimage;

    var post = new Post(user, bigimage, smallimage);

    var MAX_HEIGHT = 100;
    images(name.path).size(1024).draw(images(config.upload.Imgpath + "waterMark.png"),10,10)
        .save(des_file,{
            quality:50
        });
    images(name.path).size(100).save(des_file_s,{
        quality:50
    });
    try {
        // fs.readFile(name.path + "", function (err, data) {
        //     //var base64Data = req.body.imgData;
        //     var img = new Canvas.Image;
        //
        //     img.onload = function () {
        //         var w = img.width;
        //         var h = img.height;
        //
        //         var canvas = new Canvas(w, h);
        //
        //         var ctx = canvas.getContext('2d');
        //
        //         canvas.width = w;
        //         canvas.height = h;
        //         ctx.drawImage(img, 0, 0, w, h);
        //         ctx.drawImage(waterMarkimg, 0, 0, w / 4, h / 4);
        //
        //         var out = fs.createWriteStream(des_file);
        //         var stream = canvas.createSyncJPEGStream({
        //             bufsize: 2048,
        //             quality: 80
        //         });
        //
        //         stream.on('data', function (chunk) {
        //             out.write(chunk);
        //         });
        //
        //         stream.on('end', function () {
        //             out.end();
        //             //res.send("上传成功！");
        //         });
        //     }
        //
        //     img.onerror = function (err) {
        //         res.send(err);
        //     }
        //
        //     img.src = data;
        /*var img1 = new Canvas.Image;

         img1.onload = function () {
         var w = img1.width;
         var h = img1.height;
         // 如果高度超标
         if (w > MAX_HEIGHT) {
         // 宽度等比例缩放 *=
         w *= MAX_HEIGHT / h;
         h = MAX_HEIGHT;
         }
         var canvas = new Canvas(w, h);
         var ctx = canvas.getContext('2d');
         // canvas清屏
         //ctx.clearRect(0, 0, canvas.width, canvas.height);
         // 重置canvas宽高
         canvas.width = w;
         canvas.height = h;
         ctx.drawImage(img1, 0, 0, w, h);

         var out = fs.createWriteStream(des_file_s);
         var stream = canvas.createJPEGStream({
         bufsize: 2048,
         quality: 80
         });

         stream.on('data', function (chunk) {
         out.write(chunk);
         });

         stream.on('end', function () {
         out.end();

         });
         }

         img1.onerror = function (err) {
         //res.send(err);
         callback(err);
         }

         img1.src = data;*/
        post.save(function (err) {
            if (err) {
                return res.end(err);
            } else {
                var response = {
                    'success': '上传成功',
                    'imgurl': "images/" + imgname + "." + exname
                    //'imgname': year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '-' + value + "." + exname
                };
                // res.end(JSON.stringify(response));
                callback(null, response);
            }
        });
        //res.end(JSON.stringify(response));
        //});
        //fs.writeFile(des_file, data, function (err) {
        //    var response;
        //    if (err) {
        //        res.end(err);
        //    } else {
        //        response = {
        //            'success': '上传成功',
        //            'imgurl': "images/" + imgname + "." + exname
        //            //'imgname': year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '-' + value + "." + exname
        //        };
        //    }
        //    //console.log(imgname);
        //    //console.log(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '提交成功');
        //    //console.log(exname);
        //    //console.log(response);
        //    post.save(function (err) {
        //        if (err)
        //            return res.end(err);
        //    });
        //    res.end(JSON.stringify(response));
        //});
        // });
    } catch (e) {
        //res.json({'error': e.toString()});
        callback(e);
    }finally {
        images.gc()
    }
};