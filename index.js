const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { User } = require("./models/User")

const config = require('./config/key')


//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI
).then(() => console.log('MongoDB Connected...'))
 .catch(err => console.log(err))
 
app.get('/', (req, res) => {
    res.send('안녕하신가')
})

app.post('/register', (req, res) => {
    // 회원 가입 시 필요한 정보들을 클라이언트에서 가져오면, 그것들을 DB에 넣어준다
    // 그래서 유저 모델을 가져와야

    const user = new User(req.body)

    user.save((err, userInfo) => {
        //저장시 에러가 있다면, 클라이언트에 에러가 있다고 전달(json형식으로)
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            // 성공 시에는, 성공했다고 전달
            success: true
        })
    })
})

app.post('/login', (req, res) => {

    // 요청된 이메일을 데이터베이스에서 있는지 찾는다
    User.findOne({email: req.body.email}, (err, user) => {
        if(!user){ // 유저가 없다면
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다"
            })
        }

    // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
        //isMatch는 비밀번호가 맞다면 True 아니면 False
        if(!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다"})

        // 비밀번호가 맞다면 토큰을 생성
        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err);
            // 에러코드(400) 일 시 err 보냄

            // 토큰을 저장한다. 어디에 ? - 쿠키에 해도, 로컬 스토리지에 해도, 세션에 해도 된다. 여기서는 쿠키
            res.cookie("x_auth", user.token)
            .status(200)
            .json({loginSuccess: true, userId: user._id})
        })
    })
})
})


app.listen(port, () => 
  console.log(`Example app listening on port ${port}`)
)