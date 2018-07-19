const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const PORT = process.env.PORT || 5000;
//const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(session({secret: "vcjhsvcvdshavcsvdcm", saveUninistialized: true, resave: true, cookie:{ maxAge: 604800}}));

let Users = [];
let Entries = [];

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', function(req, res){
	//res.sendFile(path.join(__dirname+'/index.html'));
	res.render('index', {email: req.session.user});
});

app.get('/signup', function(req, res){
	res.render('index');
});

app.get('/sign', function(req, res){
	res.render('sign');
});

app.get('/about', function(req, res){
	res.render('about');
});

app.get('/entries', function(req, res){
	if( ! req.session.user )
	{
	  var err = new Error("Not logged in!");
      res.render('sign', {message: err});
	}
	res.render('entries', {entries: req.session.entries, email: req.session.user});
});

app.get('/view_entry/:id', function(req, res) {
  let id = req.params.id;
  let item = req.session.entries[id];
  res.render('entry_view', {id:id, item:item});
});

app.post('/view_entry/:id', function(req, res) {
  let id = req.params.id;
  let item = req.session.entries[id];
  let updateEntry = {title:req.body.title, message:req.body.message};
  req.session.entries[id] = updateEntry;
  res.redirect('/entries');
});

function checkSignIn(req, res){
   if(req.session.user){
      res.render('entry', {email: req.session.user.first_name});//If session exists, proceed to page
   } else {
      var err = new Error("Not logged in!");
      res.render('sign', {message: err}); //Error, trying to access unauthorized page!
   }
}

app.get('/entry', checkSignIn, function(req, res){
	res.render('entry', {email: req.session.user});
});

app.get('/signout', function(req, res){
   req.session.destroy(function(){});
   res.redirect('/sign');
});


app.post('/api/v1/signup', function(req, res){
	if(!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password)
	{
		res.render('index', {message: "All fields are required"});
	}
	else
	{
		Users.filter(function(user){
			if(user.email === req.body.email)
			{
				res.render('index', {message: "User already exist!"});
			}
		});

		var newUser = {first_name:req.body.first_name, last_name:req.body.last_name, email:req.body.email, password:req.body.password};
		Users.push(newUser);
		req.session.user = newUser;
		res.redirect('/sign')
	}
});

app.post('/api/v1/signin', function(req, res)
{
	
	if(!req.body.email || !req.body.password){
		
		res.render('sign', {message: "All fields are required"});
	}
	else
	{
		Users.filter(function(user){
			if(user.email === req.body.email && user.password === req.body.password)
			{
				req.session.user = user;
				res.redirect('/entry');
			}
		});
		
		res.render('sign', {message: "Incorrect Login!"});
	}
});

app.post('/api/v2/entries', function(req, res)
{
	if(!req.body.title || !req.body.message)
	{
		res.render('entry', {message: "Please fill all fields", email: req.session.user});
	}
	else
	{
		var newEntry = {title:req.body.title, message:req.body.message};
		Entries.push(newEntry);
		req.session.entries = Entries;
		res.redirect('/entries');
	}
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));