// 与.env文件中获取信息相关
require('dotenv').config();
// let pgp = require('../pg-promise/typescript/pg-promise')();
let pgp = require('pg-promise')();
let connectString = process.env.DB_CONNECT;
let db = pgp(connectString);
// 为让 promptinfo 呈现出不同的状态，将res.redirest替换为了res.render
// 一定程度上增加了代码的复杂度，需完善
let promptinfo;

function login(req, res, next){
    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
        .then((result)=> {
            if(result[0] === undefined){
                res.render('login',{title:'Log In', promptinfo: '没有该用户'});
            }else{
                if(result[0].password === req.body.password){
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
        .then((result)=> {
            //用户名可用时
            if(result[0] === undefined){
                //判断两次密码是否输入一致
                if(req.body.password === req.body.password2) {
                    db.none('INSERT INTO userinfo(username, password, email, telephone) VALUES($1,$2,$3,$4)', [req.body.username, req.body.password2, req.body.email, req.body.telephone])
                        .then(()=>{
                            db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
                                .then((result)=> {
                                    if(result[0])
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

function toUserinfoManagement(req, res, next){
    keepLogin(req, res);
    db.any("SELECT * FROM userinfo")
        .then((result)=> {
            if(result[0] === undefined){
                promptinfo="没有用户信息";
                res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
            }else{
                promptinfo = "Welcome to 用户管理界面!";
                res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
            }
        })
        .catch((err)=>{
            return next(err);
        });
}

function addUserinfoGET(req, res, next) {
    keepLogin(req, res);
    res.render('users_add', {title: 'Add User', test: res.locals.islogin, promptinfo: "添加用户"});
}

function addUserinfoPOST(req, res, next){
    keepLogin(req, res);
    //判断用户名是否存在
    db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
        .then((result)=> {
            //用户名可用时
            if(result[0] === undefined){
                //判断两次密码是否输入一致
                if(req.body.password === req.body.password2) {
                    db.none('INSERT INTO userinfo(username, password, email, telephone) VALUES($1,$2,$3,$4)', [req.body.username, req.body.password2, req.body.email, req.body.telephone])
                        .then(()=>{
                            db.any("SELECT * FROM userinfo WHERE username = $1", req.body.username)
                                .then((result)=> {
                                    if(result[0]){
                                        promptinfo = "用户 " + req.body.username + " 信息添加成功";
                                        res.redirect('/users');
                                        //res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                                    }
                                    else
                                        res.render('users_add',{title:'Add User',test: res.locals.islogin, promptinfo: '添加失败，请重新登录'});
                                })
                        })
                }else
                    res.render('users_add',{title:'Add User',test: res.locals.islogin, promptinfo: '两次输入密码不一致，请重新设置'});
            } else
                res.render('users_add',{title:'Add User',test: res.locals.islogin, promptinfo: '该用户名已经存在'});
        })
        .catch((error)=> {
            console.log(error);
        });
}

function deleteUserinfo(req, res, next){
    keepLogin(req, res);
    db.none("DELETE FROM userinfo WHERE id = $1", req.params.id)
        .then(()=> {
            db.any("SELECT * FROM userinfo")
                .then((result) => {
                    promptinfo = "用户信息删除成功";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                })
                .catch((err) => {
                    return next(err);
                });
        })
        .catch((err)=>{
            return next(err);
        });
}

function updateUserinfoGET(req, res, next){
    keepLogin(req, res);
    db.any("SELECT * FROM userinfo WHERE id = $1", req.params.id)
        .then((result)=> {
            if(result[0] === undefined){
                promptinfo = "修改失败";
                res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
            }else{
                promptinfo = "修改用户信息";
                res.render('users_update', {title: 'Update User', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
            }
        })
        .catch((err)=>{
            return next(err);
        });
}

function updateUserinfoPOST(req, res, next){
    keepLogin(req, res);
    db.none('UPDATE userinfo SET username=$2, email=$3, telephone=$4 WHERE id = $1',[req.body.id, req.body.username, req.body.email, req.body.telephone])
        .then(()=> {

            db.any("SELECT * FROM userinfo")
                .then((result)=> {
                    promptinfo = "用户 " + req.body.username + " 信息修改成功";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                })
                .catch((err)=>{
                    return next(err);
                });
        })
        .catch((err)=>{
            return next(err);
        });
}

function queryUserinfo(req, res, next){
    keepLogin(req, res);
    let username = req.body.s_username;
    let telephone = req.body.s_telephone;

    // 如果姓名和电话都为空，则查询所有信息：
    if (!username && !telephone) {
        db.any("SELECT * FROM userinfo")
            .then((result) => {
                if (result[0] === undefined) {
                    promptinfo ="没有用户信息";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                } else {
                    promptinfo = "所有用户信息";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                }
            })
            .catch((err) => {
                return next(err);
            });
    }

    // 如果用户名不为空，则以用户名为条件进行查询
    if (username) {
        db.any("SELECT * FROM userinfo WHERE username = $1", username)
            .then((result) => {
                if (result[0] === undefined) {
                    promptinfo = "没有用户信息";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                } else {
                    promptinfo = "用户 " + username + " 的相关信息";
                    res.render('user', {
                        title: 'User Info',
                        test: res.locals.islogin,
                        promptinfo: promptinfo,
                        datas: result
                    });
                }
            })
            .catch((err) => {
                return next(err);
            });
    }

    // 如果电话号码不为空，则以电话号为条件进行查询
    if (telephone) {
        db.any("SELECT * FROM userinfo WHERE telephone = $1", telephone)
            .then((result) => {
                if (result[0] === undefined) {
                    promptinfo = "没有用户信息";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                } else {
                    promptinfo = "电话号为 " + telephone + " 的用户相关信息";
                    res.render('user', {
                        title: 'User Info',
                        test: res.locals.islogin,
                        promptinfo: promptinfo,
                        datas: result
                    });
                }
            })
            .catch((err) => {
                return next(err);
            });
    }

    // 如果用户名和电话号码都不为空，则同时以用户名和电话号码为条件进行查询
    if (username && telephone) {
        db.any("SELECT * FROM userinfo WHERE username = $1 AND telephone = $2", username, telephone)
            .then((result) => {
                if (result[0] === undefined) {
                    promptinfo = "没有用户信息";
                    res.render('user', {title: '用户管理', test: res.locals.islogin, promptinfo: promptinfo, datas: result});
                } else {
                    promptinfo = "电话号为 " + telephone + " ，用户名为 " + username + " 的相关信息";
                    res.render('user', {
                        title: 'User Info',
                        test: res.locals.islogin,
                        promptinfo: promptinfo,
                        datas: result
                    });
                }
            })
            .catch((err) => {
                return next(err);
            });
    }
}

function keepLogin(req, res){
    if(req.cookies.islogin){
        req.session.islogin=req.cookies.islogin;
    }
    if(req.session.islogin){
        res.locals.islogin=req.session.islogin;
    }
}

module.exports = {
    login : login,
    register : register,
    toUserinfoManagement : toUserinfoManagement,
    addUserinfoGET: addUserinfoGET,
    addUserinfoPOST: addUserinfoPOST,
    deleteUserinfo : deleteUserinfo,
    updateUserinfoGET : updateUserinfoGET,
    updateUserinfoPOST : updateUserinfoPOST,
    queryUserinfo : queryUserinfo
};