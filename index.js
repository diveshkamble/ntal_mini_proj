var mysql = require('mysql');
var logger = require('morgan');
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var request = require('request');
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var admin = require("firebase-admin");
var conn = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'OnlineBookStore'
});
var validator = require('express-validator');

//middlewares remove morgan before prensentation
//remove console.log
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));


app.get("/",function(req,res){
  res.render("login");
});
app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login-submit",function(req,res){
  console.log(req.body);
	conn.query('select * from users where email=? and password = ?',[req.body.email,req.body.password],function(error,results,fields){
		if(results!='')
		{
			console.log(results);
			console.log("found");
			res.redirect('browse');
		}

		else {
			{
				console.log("not found");
				res.render('login');
			}
		}
	});

});


app.post('/comment',function(req,res){
	console.log(req);
	data=req.body.comment;
	conn.query('insert into `comments` (comment) values (?)',data,function(error,result,fields){
		console.log("successful");
		console.log(result);
		res.redirect('browse');
		if(error) throw error;
	});

});

app.post('/checkout',function(req,res){
	console.log(req);
	res.render('checkout',{total:req.body.total});
});

app.get('/browse',function(req,res){
	conn.query('select * from comments',function(error,result,fields){
		console.log(result);

		if(error) throw error;
	});
	res.render('browse');
});


app.post('/orderconfirmed',function(req,res){
	res.render('orderconfirmed');
});

app.post("/signup-submit",function(req,res){
  console.log(req.body);
var data = {first_name:req.body.firstname,last_name:req.body.lastname,email:req.body.email,password:req.body.password,branch:req.body.branch,year:req.body.year,uniqueid:req.body.uniqueid};
 //console.log(data);
conn.query('select * from users where email=?',[req.body.email],function(error,results,fields){
console.log(results);
  if(results==''){
    conn.query('insert into `users` SET ?',data,function(error,result,fields){
      console.log("successful");
      console.log(result);
      res.redirect("login");
      if(error) throw error;
    });
  }
else{
	console.log("Already exists");
  res.redirect("signup");
}
if (error) throw error;
});
});

app.get('/search',function(req,res){
	console.log(req);
});
io.on('connection',function(socket){
	socket.on("getComments",function(data){
		conn.query('select * from comments' ,function(error,results,fields){
					socket.emit("commentsData",results);
		});
	});
});

server.listen(port,function(){
	console.log('Server listening at port %d', port);
});
