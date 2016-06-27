//var Canvas = require('canvas'); //需安装canvas模块
var crypto = require('crypto');
 /*Post = require('../models/post.js'),
 Comment = require('../models/comment.js'),*/
var User = require('../models/user.js');
var watermark = require('../models/waterMark.js');
var express = require('express');
var fs = require('fs');
var multipart = require('connect-multiparty');
var config = require("../config.js");
var multipartMiddleware = multipart();
//var waterMarkimg = new Canvas.Image;
//waterMarkimg.src = config.upload.Imgpath + "waterMark.png";
var router = express.Router();

/* GET home page.get方式跳转页面 */
//router.get('/p', checkLogin);
router.get('/', function (req, res, next) {
    if (req.session.user == undefined) {
        return res.sendFile(config.upload.absolute + "login.html");

    }
    else
        return res.sendFile(config.upload.absolute + "test.html");

    //return res.render('http://localhost:3001/login"');
});
/*
 router.get('/p',function(req, res, next){
 if(req.session.user==undefined){
 return res.sendFile(config.upload.absolute + "login.html");
 }
 next();
 });
 */
router.get('/p', function (req, res, next) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    /**if(!req.session.user)
     return res.sendFile(config.upload.absolute + "login.html");*/
    //return res.render('http://localhost:3001/login"');
    var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 12条数据/home/huang/文档/node/爬虫/Blibli
    Post.getTwel(req.session.user.name, page, function (err, posts, total) {
        if (err) {
            posts = [];
        }
        if (!(total % 12)) {
            total = total - 1;
        }
        res.json({
            posts: posts,
            page: page,
            //total: total,
            totalpage: parseInt(total / 12 + 1),
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 12 + posts.length) == total
        })

    });
});
// router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
        return res.json({'error': '两次输入的密码不一致!'});
    }
    //生成密码的 md5 值.
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('he34.pngx');
    var newUser = new User({
        name: name,
        password: password,
        email: req.body.email,
        user_collection: "",
        account: 0
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
        if (err) {
            return res.json({'error': err});
        }
        if (user) {
            return res.json({'error': '用户已存在!'});
        }
        //如果不存在则新增用户
        newUser.save(function (err, user) {
            if (err) {
                res.json({'error': err});
            }
            res.json({'success': '注册成功!'});
        });
    });
});
router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
    res.sendFile(config.upload.absolute + 'login.html');
});


router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
        if (!user) {
            return res.json({'error': '用户不存在!'});
        }
        //检查密码是否一致
        if (user.password != password) {    //‘数据表user’的密码与请求的密码对比
            return res.json({'error': '密码错误!'});
        }
        //用户名密码都匹配后，将用户信息存入 session
        req.session.user = user;
        res.json({'success': '登录成功!', 'coll': user.user_collection, 'account': user.account});
    });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
    req.session.user = null;
    res.json({'success': '登出成功!'});
});
/**
 * 文件上传
 * 加入了是否登录检测
 */

router.post('/upload', checkLogin);
router.post('/upload', multipartMiddleware, function (req, res) {
    var user = req.session.user;
    watermark.photo(req.files.filename, user, function (err, response) {
        if (err) {
            return console.log(err);
        } else {
            res.end(JSON.stringify(response));
        }
    });
    // var newname = utility.md5(filename + String((new Date()).getTime())) + path.extname(filename);
    //生成密码的 md5 值
    /*crypto.randomBytes(10, function(ex, buf) {
     var token = buf.toString('hex');
     console.log('token='+token);
     });*/
    /*var user = req.session.user;
     var charactors = "1234567890";
     var value = '', i;
     for (var j = 1; j <= 4; j++) {
     i = parseInt(10 * Math.random());
     value = value + charactors.charAt(i);
     }
     console.log(value);
     //alert(value);
     var md5 = crypto.createHash('md5'),
     //imgname = md5.update(req.files.filename.name + String((new Date()).getTime())).digest('hex');
     //imgname = String((new Date()).getTime());
     //imgname = new Date();
     date = new Date();
     var year = date.getFullYear();
     var month = date.getMonth();
     var day = date.getDate();
     var hour = date.getHours();
     var min = date.getMinutes();
     var sec = date.getSeconds();
     var imgname = year + '-' + month + '-' + day + '-' + hour + ':' + min + ':' + sec + '-' + value;
     console.log(date);
     var exname = req.files.filename.name.substring(req.files.filename.name.lastIndexOf('.') + 1);
     var bigimage = imgname + "." + exname;
     var des_file = config.upload.path + bigimage;
     var smallimage = imgname + '_small' + "." + exname;
     var des_file_s = config.upload.path + smallimage;
     //var des_file_s1 = config.upload.path +'1231'+ smallimage;

     var post = new Post(user.name, bigimage, smallimage);

     //var des_file = config.upload.path + year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '-' + value + "." + exname;
     // 参数，最大高度
     /!*if(ico==exname){
     res.send({status:'success'});
     }*!/

     var MAX_HEIGHT = 100;
     try {
     fs.readFile(req.files.filename.path + "", function (err, data) {
     //var base64Data = req.body.imgData;
     var img = new Canvas.Image;

     img.onload = function () {
     var w = img.width;
     var h = img.height;

     var canvas = new Canvas(w, h);

     var ctx = canvas.getContext('2d');

     canvas.width = w;
     canvas.height = h;
     ctx.drawImage(img, 0, 0, w, h);
     ctx.drawImage(waterMarkimg, 0, 0, w / 4, h / 4);

     var out = fs.createWriteStream(des_file);
     var stream = canvas.createSyncJPEGStream({
     bufsize: 2048,
     quality: 80
     });

     stream.on('data', function (chunk) {
     out.write(chunk);
     });

     stream.on('end', function () {
     out.end();
     //res.send("上传成功！");
     });
     }

     img.onerror = function (err) {
     res.send(err);
     }

     img.src = data;
     var img1 = new Canvas.Image;

     img1.onload = function () {
     var w = img.width;
     var h = img.height;
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
     ctx.drawImage(img, 0, 0, w, h);

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
     var response = {
     'success': '上传成功',
     'imgurl': "images/" + imgname + "." + exname
     //'imgname': year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '-' + value + "." + exname
     };
     res.end(JSON.stringify(response));
     });
     }

     img1.onerror = function (err) {
     res.send(err);
     }

     img1.src = data;
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
     });
     } catch (e) {
     res.json({'error': e.toString()});
     }*/

    //已经可以做进一步处理 req.files

});
function checkLogin(req, res, next) {
    if (!req.session.user) {
        /**
         * 此处要加retrun
         * 不然next（）会继续执行下一条
         */
        //return res.sendFile(config.upload.absolute + "login.html");
        return res.json({'error': '未登录!'});
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session != undefined) {
        if (req.session.user) {
            return res.json({'error': '已登录!'});
        }
    }
    next();
}
module.exports = router;
