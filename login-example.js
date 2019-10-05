require('dotenv').config();
let pgp = require('pg-promise')();
let connectString = process.env.DB_CONNECT;
let db = pgp(connectString);

function login(req, res, next){
    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
        .then((data)=> {
            if(data[0] === undefined){
                res.render('login',{title:'Log In', promptinfo: '没有该用户'});
            }else{
                if(data[0].password === req.body.password){
                    req.session.islogin = req.body.username;
                    res.locals.islogin = req.session.islogin;
                    res.cookie('islogin',res.locals.islogin,{maxAge:60000});
                    res.redirect('/');
                }else
                {
                    res.render('login',{title:'Log In', promptinfo: '密码不正确，请重新输入'});
                }
            }
        })
        .catch((err)=>{
            return next(err);
        });
}

function register(req, res){
    //判断用户名是否存在
    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
        .then((data)=> {
            //用户名可用时
            if(data[0] === undefined){
                //判断两次密码是否输入一致
                if(req.body.password === req.body.password2) {
                db.none('INSERT INTO userinfo(username, password, email) VALUES($1,$2,$3)', [req.body.username, req.body.password2, req.body.email])
                    .then(()=>{
                    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
                        .then((data)=> {
                            if(data[0])
                                res.render('reg',{title:'Sign Up', promptinfo: '注册成功，请登录'});
                            else
                                res.render('reg',{title:'Sign Up', promptinfo: '注册失败，请重新注册'});
                        })
                    })
                }else
                    res.render('reg',{title:'Sign Up', promptinfo: '两次输入密码不一致，请重新设置'});
            } else
                res.render('reg',{title:'Sign Up', promptinfo: '该用户名已经存在'});
        })
        .catch((error)=> {
            console.log(error);
        });
}

module.exports = {
    login : login,
    register : register
};