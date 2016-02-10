var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('TODO API Root');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoid = parseInt(req.params.id);
	var matchedItem = _.findWhere(todos, {id: todoid});

	if(matchedItem){
		res.json(matchedItem);
	}else{
		res.status(404).send();	
	}
	
});

//POST - /todos
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');;	

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(404).send();
	}
	
	body.description = body.description.trim();
	body.id = todoNextId++;
	
	todos.push(body);
	
	res.json(body);
});

app.listen(PORT, function () {
	console.log('Express listening on port : ' + PORT);
});