var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

//sync({force: true}) - will drop the tables and recreate them
sequelize.sync({

}).then(function() {
	console.log('Everything is synced');
//fetched todo item by its id
	Todo.findById(3).then(function (todo) {
		if(todo){
			console.log(todo.toJSON());
		}else{
			console.log('Todo item not found');
		}
	});
	// Todo.create({
	// 	description: 'visit grany',
	// 	completed: false
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'Clean office'
	// 	});
	// }).then(function() {
	// 	//return Todo.findById(1)
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%Office%'
	// 			}
	// 		}
	// 	})
	// }).then(function (todos) {
	// 	if(todos){
	// 		todos.forEach(function (todo) {
	// 			console.log(todo.toJSON());
	// 		})			
	// 	}else{
	// 		console.log('No todos found');
	// 	}
	// }).catch(function(e) {
	// 	console.log(e);
	// });
});