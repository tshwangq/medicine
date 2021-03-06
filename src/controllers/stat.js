/**
 * @file <h4>统计接口</h4>
 *
 * 统计相关功能，主要实现功能有：
 *
 * <ol>
 * <li>收银统计</li>order
 * <li>销售员毛利率统计</li>
 * <li>品类统计</li>
 * </ol>
 *
 */

const moment = require('moment');
var fs = require('fs');

const { Order, Member } = require('../models/index');
const config = require('../../config');


/**
 * 
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Date}     req.body.StartTime 开始时间
 * @param  {Date}     req.body.EndTime 结束时间
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.visit = (req, res, next) => {
    //SELECT AA.CreateTime , BB. NAME , BB.MobilPhone , AA.Style , AA.Remarks , CC. NAME AS EmployeeName FROM Visits AS AA INNER JOIN Members AS BB ON AA.MemberID = BB.ID INNER JOIN Members AS CC ON AA.OperatorID = CC.ID where AA.CreateTime >: START and AA.CreateTime <=: END

    let { StartTime = '', EndTime = '', Keyword = "" } = req.body;

    console.log(req.body);

    if (!StartTime && !EndTime) {
        StartTime = moment().add(-1, "days").format('YYYY-MM-DD');
        EndTime = moment().add(1, "days").format('YYYY-MM-DD');
    }

    console.log({ StartTime, EndTime });

    Member.visitStat(StartTime, EndTime, function (err, rows) {
        if (err) {
            return res.send({ code: -2, message: "数据操作错误，请重试" });
        }

        rows.forEach(r => r.StyleLabel = ["电话", "微信", "短信", "其它"][r.Style]);

        return res.send({ code: 0, message: "获取数据成功", data: rows });
    });
}

/**
 * 收银统计
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Date}     req.body.StartTime 开始时间
 * @param  {Date}     req.body.EndTime 结束时间
 * @param  {Function} next 管道操作，传递到下一步
 */
exports.cash = (req, res, next) => {

    let { StartTime = '', EndTime = '', Keyword = "", action } = req.body;

    if (!StartTime && !EndTime) {

        const dt = new Date();

        dt.setMonth(dt.getMonth() - 1);

        StartTime = moment(dt).format('YYYY-MM-DD');
        EndTime = moment(new Date()).format('YYYY-MM-DD');
    }

    Order.cash(StartTime, EndTime, Keyword, function (err, mem) {

        if (err) {
            return res.send({ code: 2, message: "数据库出错" });
        };

        if (action == 'export') {
            let csvStr = `日期,零售总单id,总单金额,收银方式,收银金额,收银员\r\n`;

            mem.forEach(item => {
                csvStr += `${moment(item.CreateTime).format("YYYY-MM-DD")},${item.ID},${item.TotalAmount},${item.PayStyleLabel},${item.ReceiptAmount},${item.EmployeeName}\r\n`;
            })

            let filename = `cash_${moment(StartTime).format("YYYY-MM-DD")}_${moment(EndTime).format("YYYY-MM-DD")}.csv`;
            let urlfile = `${config.UrlTemFile}/${filename}`;

            fs.writeFile(config.TempFileRoot + "/" + filename, csvStr, 'utf8', function (err) {
                console.log(err);
            });

            return res.send({ code: 0, message: "收银统计操作成功！", data: mem, url: urlfile, filename });
        }

        return res.send({ code: 0, message: "收银统计操作成功！", data: mem });
    });
}

/**
 * 销售员毛利率统计
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 * @param  {Date}     req.body.StartTime 开始时间
 * @param  {Date}     req.body.EndTime 结束时间
 */
exports.rate = (req, res, next) => {

    console.log(req.body);

    let { EmployeeID = -1, StartTime = '', EndTime = '', action } = req.body;

    if (!StartTime && !EndTime) {

        const dt = new Date();

        dt.setMonth(dt.getMonth() - 1);

        StartTime = moment(dt).format('YYYY-MM-DD');
        EndTime = moment(new Date()).format('YYYY-MM-DD');
    }

    Order.rate(EmployeeID, StartTime, EndTime, function (err, mem) {

        if (err) {
            return res.send({ code: 2, message: "数据库出错" });
        };

        if (action == 'export') {
            let csvStr = `日期,零售总单id,商品id,商品名称,通用名称,规格,单位,生产厂家,数量,单价,销售金额,默认单价,进价,毛利,毛利率,销售员\r\n`;

            mem.forEach(item => {
                csvStr += `${moment(item.CreateTime).format("YYYY-MM-DD")},${item.ID},${item.GoodID},${item.Name},${item.OfficalName},${item.Dimension},${item.Unit},${item.Manufacturer},${item.Quantity},${item.FinalPrice},${item.GoodAmount},${item.DefaultPrice},${item.DefaultCostPrice},${item.GrossProfit},${item.GrossMargin},${item.EmployeeName}\r\n`;
            })

            let filename = `rate_${moment(StartTime).format("YYYY-MM-DD")}_${moment(EndTime).format("YYYY-MM-DD")}.csv`;
            let urlfile = `${config.UrlTemFile}/${filename}`;

            fs.writeFile(config.TempFileRoot + "/" + filename, csvStr, 'utf8', function (err) {
                console.log(err);
            });

            return res.send({ code: 0, message: "销售员毛利率统计操作成功！", data: mem, url: urlfile, filename });
        } else {
            return res.send({ code: 0, message: "销售员毛利率统计操作成功！", data: mem });
        }
    });
}

/**
 * 销售品类统计
 * @param  {Object}   req  http 请求对象
 * @param  {Object}   res  http 响应对象
 * @param  {Function} next 管道操作，传递到下一步
 * @param  {Date}     req.body.StartTime 开始时间
 * @param  {Date}     req.body.EndTime 结束时间
 */
exports.good = (req, res, next) => {

    let { Keyword = "", StartTime = '', EndTime = '', action } = req.body;

    if (!StartTime && !EndTime) {

        const dt = new Date();

        dt.setMonth(dt.getMonth() - 1);

        StartTime = moment(dt).format('YYYY-MM-DD');
        EndTime = moment(new Date()).format('YYYY-MM-DD');
    }

    Order.good(Keyword, StartTime, EndTime, function (err, mem) {

        if (err) {
            return res.send({ code: 2, message: "数据库出错" });
        };

        if (action == 'export') {
            let csvStr = `商品id,商品名称,通用名称,规格,单位,生产厂家,数量之和,单价平均,销售金额之和,毛利之和,毛利率,默认单价\r\n`;

            mem.forEach(item => {
                csvStr += `${item.GoodID},${item.GoodName},${item.OfficalName},${item.Dimension},${item.Unit},${item.Manufacturer},${item.SumQuantity},${item.FinalPrice},${item.SumAmount},${item.GrossProfit},${item.GrossMargin},${item.DefaultCostPrice}\r\n`;
            })

            let filename = `good_${moment(StartTime).format("YYYY-MM-DD")}_${moment(EndTime).format("YYYY-MM-DD")}.csv`;
            let urlfile = `${config.UrlTemFile}/${filename}`;

            fs.writeFile(config.TempFileRoot + "/" + filename, csvStr, 'utf8', function (err) {
                console.log(err);
            });

            return res.send({ code: 0, message: "销售统计操作成功！", data: mem, url: urlfile, filename });
        } else {
            return res.send({ code: 0, message: "销售统计操作成功！", data: mem });
        }
    });
}