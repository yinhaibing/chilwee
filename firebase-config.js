// Firebase 配置文件
// 超威电池开门红抽奖 - Firebase 配置

const firebaseConfig = {
    apiKey: "AIzaSyD0jnS67gJzsCR9scmco_RjMxK_T8mCV-Y",
    authDomain: "chilwee.firebaseapp.com",
    databaseURL: "https://chilwee-default-rtdb.firebaseio.com",
    projectId: "chilwee",
    storageBucket: "chilwee.firebasestorage.app",
    messagingSenderId: "454768941431",
    appId: "1:454768941431:web:595ad4d91c5761d7fa6972",
    measurementId: "G-LY7GGHTJQZ"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取数据库引用
const database = firebase.database();

// 抽奖码数据集合
const lotteryCodesRef = database.ref('lotteryCodes');

// 抽奖记录数据集合
const drawRecordsRef = database.ref('drawRecords');