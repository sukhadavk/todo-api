var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
},{
	id: 2,
	description: 'Go to market',
	completed: false
},{
	id: 3,
	description: 'Go to office',
	completed: true
}];

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
		//res.send(todo.id + ' === ' + todoid);
		if(todo.id === todoid) {
			matchedItem = todo; //res.json(todo);		
		}
	});
	if(matchedItem){
		res.json(matchedItem);
	}else{
		res.json('404');	
	}
	
});

app.listen(PORT, function () {
	console.log('Express listening on port : ' + PORT);
});