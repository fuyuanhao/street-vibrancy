/*
 * 生成一个路由实例来捕获主页的GET请求；
 * 导出整个路由，并在app.js中通过app.use('/', indexRouter)中加载；
 * 其实是可以直接在app.js中写的，这里是把路由分离了出来；
 * 当访问主页时，就会调用res.render('index', { title: 'Express' });
 * 渲染index.ejs模板并显示到浏览器；
 * 这里省去文件后缀，在一定程度上提供了方便，并不过度关注使用哪个模板，模板更改后，也只需调整一处设置。
 */

let express = require('express');
let router = express.Router();
//var pgclient =require('dao/pgHelper');
//pgclient.getConnection();

let db = require('../login.js');

router.get('/', function(req, res) {
  if(req.cookies.islogin){
    req.session.islogin=req.cookies.islogin;
  }
  if(req.session.islogin){
    res.locals.islogin=req.session.islogin;
  }
  res.render('index', { title: 'HOME',test: res.locals.islogin});
});

router.route('/login')
    .get(function(req, res) {
      if(req.session.islogin){
        res.locals.islogin=req.session.islogin;
      }
      if(req.cookies.islogin){
        req.session.islogin=req.cookies.islogin;
      }
      res.render('login', { title: 'Log In' ,test:res.locals.islogin});
    })

    .post(db.login);
      /*
      result = null;
      pgclient.select('userinfo',{'username': req.body.username},'', function (result) {
        if(result[0]===undefined){
          res.send('没有该用户');
        }else{
          if(result[0].password===req.body.password){
            req.session.islogin=req.body.username;
            res.locals.islogin=req.session.islogin;
            res.cookie('islogin',res.locals.islogin,{maxAge:60000});
            res.redirect('/home');
          }else
          {
            res.redirect('/login');
          }
        }
      });*/


router.get('/logout', function(req, res) {
  res.clearCookie('islogin');
  req.session.destroy();
  res.redirect('/');
});

router.get('/home', function(req, res) {
  if(req.session.islogin){
    res.locals.islogin=req.session.islogin;
  }
  if(req.cookies.islogin){
    req.session.islogin=req.cookies.islogin;
  }
  res.render('home', { title: 'Home', user: res.locals.islogin });
});

router.route('/reg')
    .get(function(req,res){
      res.render('reg',{title:'注册'});
    })
    .post(db.register);

/*
      pgclient.save('userinfo',{'username': req.body.username,'password': req.body.password2}, function (err) {
        pgclient.select('userinfo',{'username': req.body.username},'', function (result) {
          if(result[0]===undefined){
            res.send('注册没有成功, 请重新注册');
          }else{
            res.send('注册成功');
          }
        });
      });
    });

 */

module.exports = router;