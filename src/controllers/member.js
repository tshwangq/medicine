/**
 * @file <h4>会员接口</h4>
 *
 * 会员相关功能接口，主要实现功能有：
 *
 * <ol>
 * <li>管理员登录</li>
 * <li>管理员退出</li>
 * <li>会员查询，按电话、名称查询</li>
 * <li>会员详情，会员信息、回访记录、意向记录</li>
 * <li>会员跟踪，会员回访记录、回访记录搜索</li>
 * <li>会员购买意向，会员购买意向添加，意向列表</li>
 * <li>会员管理，添加、修改、删除</li>
 * <li>会员列表，电话、姓名、意向单内容、回访记录数量、成单数量</li>
 * </ol>
 *
 */

const config = require('../../config');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const async = require('async');
const moment = require('moment');
const eventproxy = require('eventproxy');

const { Member, Visit, Intention } = require('../models/index');

/**
 * 管理员登录功能
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.signin = (req, res, next) => {
    let { login_name, password } = req.body;

    let ep = new eventproxy();
    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (!login_name || !password) {
        res.status(422);
        return res.send({ code: 2, message: "电话、密码参数不完整" });
    };

    Member.Check(login_name, function(err, mem) {
        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        if (mem) {
            bcrypt.compare(password, mem.Password, function(err, result) {

                if (err) {
                    console.error(err);
                    ep.emit('error', err);
                }

                //console.log("result", result);

                if (result) {
                    return res.send({ code: 0, message: "登录成功" });
                } else {
                    return res.status(422).send({ code: 2, message: "电话或密码不正确" });
                }
            });
        } else {

            return res.status(200).send({ code: 2, message: `${login_name}没有注册。` });
        }
    });
}

/**
 * 管理员退出功能
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.signout = (req, res, next) => {
    req.session.user = null;
    //auth.clearSession(res);
    res.send({ code: 0, message: "成功退出" });
}

/**
 * 会员查询
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.search = (req, res, next) => {
    let { keyword = "" } = req.body;

    let ep = new eventproxy();
    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    Member.Search(keyword, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 会员详情
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.memberInfo = (req, res, next) => {

    console.log("aaaaa");

    let { id = "" } = req.body;

    let ep = new eventproxy();
    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (!id) {
        res.status(422);
        return res.send({ code: 2, message: "用户id不存在" });
    };

    async.parallel([

        function(cb) {

            Member.MemberInfo(id, function(err, mem) {

                if (err) {
                    return cb(err, null);
                };

                cb(null, mem);

            });

        },

        function(cb) {

            Visit.Search(id, function(err, mem) {

                if (err) {
                    return cb(err, null);
                };

                cb(null, mem);

            });

        },

        function(cb) {

            Intention.Search(id, function(err, mem) {

                if (err) {
                    return cb(err, null);
                };

                cb(null, mem);

            });

        }
    ], function(err, result) {

        if (err) {
            ep.emit('error', "数据库操作错误");
            return res.status(403).send({ code: -1, message: "系统错误", data: error });
        };

        const data = result[0];

        return res.status(200).send({ code: 0, message: "success", data: result[0], visitData: result[1], intentionData: result[2] });

    });


}

/**
 * 回访记录列表
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.visitList = (req, res, next) => {

    let { page = 0, limit = 10 } = req.body;

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (page > 0) {
        page = (page - 1) * limit;
    }

    visitList.visitList(page, limit, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 意向记录列表
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.intentionList = (req, res, next) => {

    let { page = 0, limit = 10 } = req.body;

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (page > 0) {
        page = (page - 1) * limit;
    }

    Intention.IntentionstList(page, limit, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 意向记录添加
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.intentionAdd = (req, res, next) => {

    let { memberId, goods } = req.body;

    let operatorId = req.session.user.MemberID;

    let createTime = new moment(new Date()).format("YYYY-MM-DD");

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (!memberId || !goods || !operatorId) {
        res.status(422);
        return res.send({ code: 2, message: "会员Id、意向商品参数不完整" });
    };

    Intention.add(memberId, operatorId, goods, createTime, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 添加会员
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 * @param  {Int}      req.body.ID 会员ID
 * @param  {String}   req.body.Name 姓名
 * @param  {String}   req.body.PinYin 姓名拼音
 * @param  {String}   req.body.Telephone 座机
 * @param  {String}   req.body.City 城市
 * @param  {Nember}   req.body.Gender 行别  1是男，2是女
 * @param  {String}   req.body.Address 地址
 * @param  {String}   req.body.Remark 备注
 * @param  {String}   req.body.MobilPhone 移动电话
 * @param  {String}   req.body.WeiXinCode 微信号
 * @param  {Tinyint}  req.body.IsWeixinFriend 是否微信好友
 * @param  {String}   req.body.FriendNamek 是谁的好友
 * @param  {String}   req.body.BirthYear 出生年代
 * @param  {String}   req.body.Diseases 疾病
 * @param  {String}   req.body.RelationWithPatient 与患者关系
 */
exports.addMember = (req, res, next) => {

    const { Name, PinYin = '', Telephone, City, Gender, Address = '', Remark = '', MobilPhone, WeiXinCode = '', IsWeixinFriend = '', FriendName = '', BirthYear = '', Diseases = '', RelationWithPatient = '' } = req.body;

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (!Name || !Telephone || !City || !Gender || !MobilPhone) {
        res.status(422);
        return res.send({ code: 2, message: "参数不完整" });
    };

    let memberData = { Name, PinYin, Telephone, City, Gender, Address, Remark, MobilPhone, WeiXinCode, IsWeixinFriend, FriendName, BirthYear, Diseases, RelationWithPatient };

    Member.addMember(memberData, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 删除会员
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.deleteMember = (req, res, next) => {

    let { memberid } = req.body;

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (!memberid) {
        res.status(422);
        return res.send({ code: 2, message: "会员Id参数不完整" });
    };

    Member.removeMember(memberid, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 修改会员
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 * @param  {Int}      req.body.ID 会员ID
 * @param  {String}   req.body.Name 姓名
 * @param  {String}   req.body.PinYin 姓名拼音
 * @param  {String}   req.body.Telephone 座机
 * @param  {String}   req.body.City 城市
 * @param  {Int}      req.body.Gender 行别
 * @param  {String}   req.body.Address 地址
 * @param  {String}   req.body.Remark 备注
 * @param  {String}   req.body.MobilPhone 移动电话
 * @param  {String}   req.body.BirthYear 出生年代
 * @param  {String}   req.body.Diseases 疾病
 * @param  {String}   req.body.RelationWithPatient 与患者关系
 */
exports.updateMember = (req, res, next) => {

    const { ID, Name, PinYin = '', Telephone, City, Gender, Address = '', Remark = '', MobilPhone, WeiXinCode = '', IsWeixinFriend = '', FriendName = '', BirthYear = '', Diseases = '', RelationWithPatient = '' } = req.body;

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (!ID || !Name || !Telephone || !City || !Gender || !MobilPhone) {
        res.status(422);
        return res.send({ code: 2, message: "参数不完整" });
    };

    let memberData = { ID, Name, PinYin, Telephone, City, Gender, Address, Remark, MobilPhone, WeiXinCode, IsWeixinFriend, FriendName, BirthYear, Diseases, RelationWithPatient };

    Member.updMember(memberData, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}

/**
 * 会员列表
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.memberList = (req, res, next) => {

    let { page = 0, limit = 10 } = req.body;

    let ep = new eventproxy();

    ep.fail(function(error) {
        console.error(error);
        return res.status(403).send({ code: -1, message: "系统错误", data: error });
    });

    if (page > 0) {
        page = (page - 1) * limit;
    }

    Member.MemberList(page, limit, function(err, mem) {

        if (err) {
            ep.emit('error', "数据库操作错误");
        };

        return res.status(200).send({ code: 0, message: "success", data: mem });

    });
}