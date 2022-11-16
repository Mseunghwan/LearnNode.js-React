const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 트림 - 즉, 사이사이 공간 자동으로 없애줌
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
        },
    role:{ // 관리자, 유저 모드 구별위함 
        type: Number, // 유저 - 0 / 관리자 - 1 이런 식
        default: 0
    },
    image: String,
    token:{
            type: String// 유효성 관리 가능
    },
    tokenExp:{
            type: Number // 토큰 사용기간 지정
    }
    })

userSchema.pre('save', function(next){
    var user = this; // this는 위 스키마 부분을 가리킴

    if(user.isModified('password')){
    // 비밀번호를 암호화시킨다
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) return next(err)
        
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err)
            user.password = hash
            // 다음(index.js에서의 User.save())를 실행하는 next()
            next()
        })
    })  
    } else {
        next()
    }  
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // plainPassword 123456 
    // 암호화된 비밀번호 $2b$10$5E9P.VyfneqH/.eXmTaPQeqIqoPTaXmdM2GLSnEYbxdasW3gUZOr2
    // 암호화 체크 방법? plainPassword를 암호화해서 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err); // 에러 있을 시 콜백
        cb(null, isMatch) // 에러 없을 시 콜백, 에러는 null(없고), isMatch는 true값이 들어가 있을 것
    })
}

userSchema.methods.generateToken = function(cb){

    var user = this;

    // jsonwebtoken을 이용해서 토큰을 생성하기
    
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // secretToken이라는 임의의 문자열을 설정하는데, 여기서 만약 토큰이 생성되면 secretToken에 따라서 user id를 판별한다
    // 즉, user._id + 'secretToken' = token 인데, secretToken을 통해 user._id 알 수 있다는 거

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

 const User = mongoose.model('User', userSchema)
 // 유저라는 모델이 userSchema 스키마를 감싼다
 module.exports = { User }
 // 다른 파일에서도 유저 모델이 사용될 수 있게 export 해준다