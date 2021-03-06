var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var bcrypt = require('bcryptjs');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var users = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO API Root');
});

// /todos?completed=true&q=house
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (typeof query !== 'undefined' && query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (typeof query !== 'undefined' && query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (typeof query !== 'undefined' && query.hasOwnProperty('q') && query.q.trim().length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		if (todos) {
			res.status(200).json(todos);
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(404).json(e);
	});
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoid = parseInt(req.params.id);

	db.todo.findOne({
		where: {
			id: todoid,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			res.status(200).json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(404).json(e);
	});
});

//POST - /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');;

	db.todo.create(body).then(function(todo) {

		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.status(200).json(todo.toJSON());
		});
	}, function(e) {
		res.status(404).json(e);
	});
});

//DELETE - /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');;

	db.todo.destroy({
		where: {
			id: todoid,
			userId: req.user.get('id')
		}
	}).then(function(numOfTodos) {
		if (numOfTodos > 0) {
			res.status(200).json(numOfTodos);
		} else {
			res.status(404).send('No todo with this id');
		}
	}, function(e) {
		res.status(404).json(e);
	});
});

//PUt - /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoid = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');;
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoid,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(404).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.status(200).json(user.toPublicJSON());
	}, function(e) {
		res.status(404).json(e);
	});
});

//POST - /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});
	}).then(function(tokenImstance) {
		res.header('Auth', tokenImstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e) {
		console.log(e)
		res.status(401).send();
	});
});


//DELETE - 	/users/logout
app.delete('/users/logout', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function() {
		res.status(500).send();
	});
});

db.sequelize.sync({
	//force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port : ' + PORT);
	});
});