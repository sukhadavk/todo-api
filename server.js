var express = require('express');
var bodyParser = require('body-parser');

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
	var matchedItem;
	todos.forEach( function (todo) {		
		if(todo.id === todoid) {
			matchedItem = todo; 
		}
	});
	if(matchedItem){
		res.json(matchedItem);
	}else{
		res.json('404');	
	}
	
});

//POST - /todos
app.post('/todos', function (req, res) {
	var body = req.body;
	console.log('description: ' + body.description);
	body.id = todoNextId;
	todoNextId++;
	todos.push({
		id: body.id, 
		description: body.description, 
		completed: body.completed
	});
	
	res.json(body);
});

app.listen(PORT, function () {
	console.log('Express listening on port : ' + PORT);
});