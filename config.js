var config = {

    DB_TEST: {
        host: 'www.loclive.cn',
        connectionLimit: 50,
        user: "root",
        port: "3360",
        password: "p@ssw0rd",
        database: "Medicine"
    },

    // DB_PRO: {
    //     host: 'localhost',
    //     connectionLimit: 50,
    //     user: "programer",
    //     port: "3306",
    //     password: "p1@32I",
    //     database: "Medicine"
    // }

    DB_PRO: {
        host: 'maria_medicine',
        connectionLimit: 50,
        user: "root",
        port: "3306",
        password: "p1@32I",
        database: "Medicine"
    }
};

module.exports = config;
