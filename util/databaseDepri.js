const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect=callback=>{
	MongoClient
		.connect(
			"mongodb+srv://node-mongo-akr:5MWyf2Hpo3lENKjU@cluster0.vgx1sko.mongodb.net/shop?retryWrites=true&w=majority"
		)
		.then(client=>{
			console.log('connected!');
			_db=client.db()
			callback()
		})
		.catch((err) => {
			console.log(err);
			throw err
		});
}

const getDb=()=>{
	if(_db){
		return _db;
	}
	throw 'No database found!'
}
exports.mongoConnect=mongoConnect;
exports.getDb=getDb;

// const Sequelize = require("sequelize");
// const sequelize = new Sequelize("node-complete", "root", "(Akarsh95)", {
// 	dialect: "mysql",
// 	host: "localhost",

// });
// module.exports=sequelize;
// const mysql=require('mysql2')
// const pool=mysql.createPool({
//   host:'localhost',
//   user:'root',
//   database:'node-complete',
//   password:'(Akarsh95)'
// });
// module.exports=pool.promise();
