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
let db = require('./login-example.js');

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
      res.render('login', { title: 'Log In' ,test:res.locals.islogin, promptinfo: '欢迎登录'});
    })
    .post(db.login);

router.get('/logout', function(req, res) {
  res.clearCookie('islogin');
  req.session.destroy();
  res.redirect('/');
});

router.route('/reg')
    .get(function(req,res){
      res.render('reg',{title:'Sign Up', promptinfo: '欢迎注册'});
    })
    .post(db.register);

router.get('/GDPQuery',db.GDPQuery);

module.exports = router;