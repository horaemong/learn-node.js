require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({
  extended: true
}))
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
var total_post;

var db;
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs')
MongoClient.connect(process.env.DB_URL, function (err, client) {
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

  app.listen(process.env.PORT, function () {
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


app.get('/list', (req, res) => {

  db.collection('post').find().toArray((err, result) => {
    console.log(result);
    res.render('list.ejs', {
      posts: result
    });
  });
})

app.delete('/delete', (req, res) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, (err, result) => {
    console.log('삭제완료');
    res.status(200).send({
      message: '성공했습니다.'
    });
  })
});


app.get('/detail/:id', (req, res) => {
  db.collection('post').findOne({
    _id: parseInt(req.params.id)
  }, (err, result) => {
    console.log(result)
    res.render('detail.ejs', {
      data: result
    })
  });
});


app.get('/edit/:id', (req, res) => {

  db.collection('post').findOne({
    _id: parseInt(req.params.id)
  }, (err, result) => {
    console.log(result);
    res.render('edit.ejs', {
      post: result
    });
  })

})


app.put('/edit', (req, res) => {
  db.collection('post').updateOne({
    _id: parseInt(req.body.id)
  }, {
    $set: {
      제목: req.body.title,
      날짜: req.body.date
    }
  }, (err, result) => {
    console.log('수정완료');
    res.redirect('/list');
  });
});


app.get('/search', (req, res) => {
  db.collection('post').find({
    $text: {
      $search: req.query.value
    }
  }).toArray((err, result) => {
    console.log(result);
    res.render('search.ejs', {
      posts: result
    })
  });
});







// 로그인
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({
  secret: '비밀코드',
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/fail'
}), (req, res) => {
  res.redirect('/')
});

app.get('/mypage', check_login, (req, res) => {
  console.log(req.user);
  res.render('mypage.ejs', {
    사용자: req.user
  });
});

function check_login(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send('로그인 안함');
  }
}

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({
    id: 입력한아이디
  }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, {
      message: '존재하지않는 아이디요'
    })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, {
        message: '비번틀렸어요'
      })
    }
  })
}));

passport.serializeUser(function (user, done) {
  done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({
    id: 아이디
  }, (err, result) => {
    done(null, {
      result
    });
  })
});

app.post('/add', (req, res) => {

  res.send('전송완료');
  console.log(req.body.title);
  console.log(req.body.date);
  db.collection('counter').findOne({
    name: '게시물갯수'
  }, (err, result) => {
    total_post = result.totalPost + 1;
    console.log(total_post);
    var save_post_data = {
      _id: total_post,
      제목: req.body.title,
      날짜: req.body.date,
      작성자: req.user._id
    }
    db.collection('post').insertOne(save_post_data, (err, res) => {
      console.log(total_post + 1);
      console.log('저장 완료');
      db.collection('counter').updateOne({
        name: '게시물갯수'
      }, {
        $inc: {
          totalPost: 1
        }
      }, (err, result) => {
        if (err) {
          return console.log(err);
        }
      });
    });


  });

});


app.use('/', require('./routes/shop.js'));

// app.get('/shop/shirts', function (요청, 응답) {
//   응답.send('셔츠 파는 페이지입니다.');
// });

// app.get('/shop/pants', function (요청, 응답) {
//   응답.send('바지 파는 페이지입니다.');
// });


//multer 라이브러리 사용
let multer = require('multer');
var storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './public/image')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
  fileFilter: function (req, file, cb) {
    // png, jpg, jpeg, gif 파일만 업로드 가능
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true)
  }

});

var upload = multer({
  storage: storage
});

app.get('/upload', (req, res) => {
  res.render('upload.ejs');
});

app.post('/upload', upload.single('profile'), (req, res) => {
  res.send('업로드 완료');
});