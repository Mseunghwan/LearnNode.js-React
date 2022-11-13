const mongoose = require('mongoose');

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
        minlength:5
    },
    lastname: {
        type: String,
        maxlength: 50
        },
    role:{ // 관리자, 유저 모드 구별위함 
        type: Number, // 유저 - 0 / 관리자 - 1 이런 식
        default: 0
    },
    image:{
        image: String,
        token:{
            type: String// 유효성 관리 가능
        },
        tokenExp:{
            type: Number // 토큰 사용기간 지정
        }
    }
})

 const User = mongoose.model('User', userSchema)
 // 유저라는 모델이 userSchema 스키마를 감싼다
 module.exports = { User }
 // 다른 파일에서도 유저 모델이 사용될 수 있게 export 해준다