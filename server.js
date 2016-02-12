var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO API Root');
});

// /todos?completed=true&q=house
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

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

app.get('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id);

	db.todo.findById(todoid).then(function(todo) {
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
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');;

	db.todo.create(body).then(function(todo) {
		res.status(200).json(todo.toJSON());
	}, function(e) {
		res.status(404).json(e);
	});
});

//DELETE - /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');;

	db.todo.destroy({
		where: {
			id: todoid
		}
	}).then(function (numOfTodos) {
		if (numOfTodos > 0) {
			res.status(200).json(numOfTodos);
		} else {
			res.status(404).send('No todo with this id');
		}
	}, function (e) {
		res.status(404).json(e);
	});
});

//PUt - /todos/:id
app.put('/todos/:id', function(req, res) {

	var todoid = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');;

	var validAttributes = {};
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(404).send({
			"Error": "completed has incorrect value type"
		});
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(404).send({
			"Error": "body has incorrect value type"
		});
	}

	var matchedItem = _.findWhere(todos, {
		id: todoid
	});
	if (matchedItem) {
		_.extend(matchedItem, validAttributes);
		res.json(matchedItem);
	} else {
		return res.status(404).send({
			"Error": "No todo found with that id"
		});
	}
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port : ' + PORT);
	});
});