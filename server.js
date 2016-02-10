var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
	var queryParms = req.query;
	var filteredTodos = todos;

	if (typeof queryParms !== 'undefined' && queryParms.hasOwnProperty('completed') && queryParms.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (typeof queryParms !== 'undefined' && queryParms.hasOwnProperty('completed') && queryParms.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (typeof queryParms !== 'undefined' && queryParms.hasOwnProperty('q') && queryParms.q.trim().length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParms.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id);
	var matchedItem = _.findWhere(todos, {
		id: todoid
	});

	if (matchedItem) {
		res.json(matchedItem);
	} else {
		res.status(404).send();
	}

});

//POST - /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');;

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(404).send();
	}

	body.description = body.description.trim();
	body.id = todoNextId++;

	todos.push(body);

	res.json(body);
});

//DELETE - /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');;

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(404).send({
			"Error": "Request has incorrect values"
		});
	}

	var matchedItem = _.findWhere(todos, {
		id: todoid
	});
	if (matchedItem) {
		todos = _.without(todos, matchedItem);
		res.json(matchedItem);
	} else {
		return res.status(404).send({
			"Error": "No todo found with that id"
		});
	}
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

app.listen(PORT, function() {
	console.log('Express listening on port : ' + PORT);
});