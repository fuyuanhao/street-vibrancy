require('dotenv').config();
let pgp = require('pg-promise')();
let connectString = process.env.DB_CONNECT;
let db = pgp(connectString);

function login(req, res, next){
    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
        .then((data)=> {
            if(data[0] === undefined){
                res.send('没有该用户');
            }else{
                if(data[0].password === req.body.password){
                    req.session.islogin = req.body.username;
                    res.locals.islogin = req.session.islogin;
                    res.cookie('islogin',res.locals.islogin,{maxAge:60000});
                    res.redirect('/');
                }else
                {
                    res.redirect('/login');
                }
            }
        })
        .catch((err)=>{
            return next(err);
        });
}

function register(req, res){
    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
        .then((data)=> {
            if(data[0] === undefined){
                db.none('INSERT INTO userinfo(username, password) VALUES($1,$2)', [req.body.username, req.body.password2])
                    .then(()=>{
                        db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
                            .then((data)=> {
                                if(data[0])
                                    res.send("注册成功");
                                else
                                    res.send("注册失败，请重新注册");
                            })
                    })
            } else {
                res.send("该账号已经存在");
            }
        })
        .catch((error)=> {
            console.log(error);
        });
}

module.exports = {
    login : login,
    register : register
};