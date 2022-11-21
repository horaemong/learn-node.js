const express = require('express');
const app = express();
app.use(express.urlencoded({
  extended: true
}))
var total_post = 0;

var db;
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs')
MongoClient.connect('mongodb+srv://hojae:ksybym486@cluster0.ztdvnuk.mongodb.net/?retryWrites=true&w=majority', function (err, client) {
  //연결되면 할 일
  if (err) {
    return console.log(err);
  }

  db = client.db('todoapp');

  // db.collection('post').insertOne({
  //   이름: 'John',
  //   나이: 20
  // }, (err, res) => {
  //   console.log('저장 완료');
  // });

  app.listen(8080, function () {
    console.log('listening on 8080');
  });
});


app.get('/pet', function (req, res) {
  res.send('hello')
});

app.get('/beauty', function (req, res) {
  res.send("hello here's beauty");
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/write.html')
});

app.post('/add', (req, res) => {
  res.send('전송완료');
  console.log(req.body.title);
  console.log(req.body.date);

  db.collection('counter').findOne({
    name: '게시물갯수'
  }, (err, result) => {
    total_post = result.totalPost;
  });
  db.collection('post').insertOne({
    _id: total_post + 1,
    제목: req.body.title,
    날짜: req.body.date
  }, (err, res) => {
    console.log('저장 완료');
  });

});


app.get('/list', (req, res) => {

  db.collection('post').find().toArray((err, result) => {
    console.log(result);
    res.render('list.ejs', {
      posts: result
    });
  });


})