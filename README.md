

2018-06-17
---------
今天任务：  
1、[ * ] 销售订单的商品删除；  
2、[ * ] 进货单的商品删除；   
3、[ * ] 退货逻辑增加；  
4、[  ] 药师提交功能、药师重置密码功能；  


2018-06-20
今天任务：
1、打印快递单；
2、修改bug;

# 需求沟通

开发人员：chen

git:

db:
dev_user01
passuser01

##

1、配置构建工具；
2、


#### 沟通变更记录
1. [ ]会员列表：增加显示字段：显示注册日期、意向标签、意向商品（显示商品名）、修改时间、创建时间;
2. [ ]会员列表，可以按修改时间排序；
2. [ ]会员列表：增加字段：意向标签
3. [ ]意向单编辑页面：增加一些标签选择：意向强烈、放弃跟踪、持续跟踪中（这个信息保存在会员表中）
4. [ ]销售单编辑：增加销售员字段（原来有一个EmployeeID字段用于记录登录雇员的ID,增加一个字段，用于记录销售员ID,销售员和记录员不一定是同一个人）
5. [ ]销售订单列表面：增加付款方式、销售员；
6. [ ]结算流程：沟通进货单-->结算 --> 显示勾选的进货单统计数据；
7. [ ]进货单需要字段：供应商、电话、联系人、日期、金额、药师


## 业务对象字段整理

1、入库单界面：收集字段  
2、供应商录入界面：收集字段  
3、药品录入页面：收集字段  
4、几个统计表的表头：

## 符合真实场景的模拟数据


> let goodData = {  
>     Name: "",  
>     NamePinYin: "",  
>     OfficalName: "",  
>     Dimension: "",  
>     FormOfDrug: "",  
>     Unit: "",  
>     DefaultCostPrice: "",  
>     DefaultPrice: "",  
>     LimitPrice: "",  
>     BidPrice: "",  
>     Manufacturer: "",  
>     Competion: "",  
>     Medicare: "",  
>     PeriodTreatment: "",  
>     Translation: "",  
>     Usage: "",  
>     Remark: "",  
>     IsForeign: "",  
>     ApprovalNumber: ""  
> };



## 业务逻辑流程整理

1、
2、
3、

# 配置React开发环境

需要的插件：

>    "scripts": {  
>        "webpack:dev": "webpack-dev-server   --config build/webpack.dev.js"  
>    },  


>  "devDependencies": {  
>        "react-hot-loader": "^4.1.2",  
>        "webpack-dev-server": "^3.1.4",  
>   }


>  devServer: {  
>        hot: true,  
>        historyApiFallback: true,  
>        headers: {   "Access-Control-Allow-Origin": "*" },  
> }  

>  plugins: [
>      new webpack.HotModuleReplacementPlugin(),  
>      new webpack.NamedModulesPlugin(),  
> ],

> output: {
>        path: path.resolve(__dirname, '../public/assets/'),
>        filename: 'js/[name].bundle.js',
>        publicPath:'http://localhost:8080/assets/'
>    }



1. Webpack-dev-server 静态资源伺服器
2. react-hot-loader react组件热替换加载器 [组件热替换加载器](https://github.com/gaearon/react-hot-loader)
3.


需要配置的地方：

1. webpack.config.js配置
    1. 路径配置:
    2.

2. react-hot-loader配置

接口：
1、