// 全局变量
let prizes = [];
let drawRecords = [];
let isSpinning = false;
let currentRotation = 0;
let useFirebase = false; // Firebase 是否已配置

// 检查 Firebase 是否已配置
try {
    if (typeof firebase !== 'undefined') {
        useFirebase = true;
        console.log('Firebase 已启用');
    }
} catch (e) {
    console.log('Firebase 未配置，使用本地模式');
}

// 颜色数组
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

// 页面加载时初始化
window.onload = function() {
    loadPrizes();
    drawWheel();
    updatePrizesList();
};

// 加载奖品数据
function loadPrizes() {
    const savedPrizes = localStorage.getItem('chaowei_prizes');
    if (savedPrizes) {
        prizes = JSON.parse(savedPrizes);
    } else {
        // 默认奖品
        prizes = [
            { id: 1, name: '一等奖：飞天茅台', quantity: 1, probability: 0.5, image: '' },
            { id: 2, name: '二等奖：五粮液', quantity: 3, probability: 2, image: '' },
            { id: 3, name: '三等奖：中华烟', quantity: 5, probability: 5, image: '' },
            { id: 4, name: '四等奖：古井原浆', quantity: 10, probability: 10, image: '' },
            { id: 5, name: '五等奖：金龙鱼油', quantity: 20, probability: 20, image: '' },
            { id: 6, name: '六等奖：大米', quantity: 50, probability: 30, image: '' },
            { id: 7, name: '七等奖：充电器', quantity: 100, probability: 32.5, image: '' }
        ];
    }
}

// 保存奖品数据
function savePrizes() {
    localStorage.setItem('chaowei_prizes', JSON.stringify(prizes));
}

// 加载抽奖码
function loadCodes() {
    const savedCodes = localStorage.getItem('chaowei_codes');
    if (savedCodes) {
        lotteryCodes = JSON.parse(savedCodes);
    } else {
        // 默认抽奖码
        lotteryCodes = ['CW2026', 'KAIMENHONG', 'LUCKY666', 'HAPPY2026'];
        localStorage.setItem('chaowei_codes', JSON.stringify(lotteryCodes));
    }
}

// 验证抽奖码（Firebase 版本）
async function verifyCode(code) {
    if (useFirebase) {
        try {
            const snapshot = await database.ref('lotteryCodes/' + code).once('value');
            const codeData = snapshot.val();
            
            if (!codeData) {
                return { valid: false, message: '抽奖码不存在' };
            }
            
            if (codeData.status === 'used') {
                return { valid: false, message: '抽奖码已使用' };
            }
            
            return { valid: true };
        } catch (error) {
            console.error('验证抽奖码失败:', error);
            return { valid: false, message: '验证失败，请重试' };
        }
    } else {
        // 本地模式
        return { valid: true };
    }
}

// 消耗抽奖码（Firebase 版本）
async function consumeCode(code, prizeName) {
    if (useFirebase) {
        try {
            const updates = {};
            updates['lotteryCodes/' + code + '/status'] = 'used';
            updates['lotteryCodes/' + code + '/usedTime'] = new Date().toLocaleString();
            updates['lotteryCodes/' + code + '/prize'] = prizeName;
            
            // 添加抽奖记录
            const recordRef = database.ref('drawRecords').push();
            updates['drawRecords/' + recordRef.key] = {
                code: code,
                prize: prizeName,
                time: new Date().toLocaleString()
            };
            
            await database.ref().update(updates);
            return true;
        } catch (error) {
            console.error('消耗抽奖码失败:', error);
            return false;
        }
    }
    return true;
}

// 绘制转盘
function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (prizes.length === 0) {
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    
    const sliceAngle = (Math.PI * 2) / prizes.length;
    
    prizes.forEach((prize, index) => {
        const startAngle = index * sliceAngle + currentRotation;
        const endAngle = startAngle + sliceAngle;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(prize.name.substring(0, 8), radius - 20, 5);
        ctx.restore();
    });
}

// 开始抽奖（Firebase 版本）
async function startLottery() {
    if (isSpinning) return;
    
    const codeInput = document.getElementById('lotteryCode');
    const code = codeInput.value.trim();
    
    if (!code) {
        alert('请输入抽奖码！');
        return;
    }
    
    // 验证抽奖码
    document.getElementById('startBtn').disabled = true;
    const verification = await verifyCode(code);
    
    if (!verification.valid) {
        alert(verification.message);
        document.getElementById('startBtn').disabled = false;
        return;
    }
    
    // 检查是否还有奖品
    const availablePrizes = prizes.filter(p => p.quantity > 0);
    if (availablePrizes.length === 0) {
        alert('抱歉，奖品已全部抽完！');
        document.getElementById('startBtn').disabled = false;
        return;
    }
    
    isSpinning = true;
    
    // 根据概率选择奖品
    const selectedPrize = selectPrizeByProbability();
    
    // 计算旋转角度
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const sliceAngle = (Math.PI * 2) / prizes.length;
    
    // 指针在顶部（12点钟方向，即-90度位置）
    // 需要让目标奖品的中心对准指针
    // 转盘绘制时，奖品0从3点钟方向（0度）开始顺时针绘制
    // 指针在12点钟方向（-90度或270度）
    // 要让奖品index的中心对准-90度，需要旋转的角度：
    // 旋转角度 = -90度 - 奖品中心角度
    // 奖品中心角度 = index * sliceAngle + sliceAngle/2
    
    const prizeCenterAngle = prizeIndex * sliceAngle + sliceAngle / 2;
    
    // 计算需要旋转到的角度（让奖品中心对准-90度）
    // 目标角度 = -90度（指针位置）- 奖品中心角度
    const targetAngle = -Math.PI / 2 - prizeCenterAngle;
    
    // 规范化角度到0-2π范围
    let normalizedTargetAngle = targetAngle % (Math.PI * 2);
    if (normalizedTargetAngle < 0) {
        normalizedTargetAngle += Math.PI * 2;
    }
    
    // 旋转5圈 + 目标角度
    const spinAngle = 360 * 5 + (normalizedTargetAngle * 180 / Math.PI);
    
    currentRotation += spinAngle * Math.PI / 180;
    
    // 动画旋转
    let animationProgress = 0;
    const animationDuration = 5000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        animationProgress = Math.min(elapsed / animationDuration, 1);
        
        const easeOut = 1 - Math.pow(1 - animationProgress, 3);
        const currentAngle = (spinAngle * easeOut) * Math.PI / 180;
        
        drawWheelWithRotation(currentAngle);
        
        if (animationProgress < 1) {
            requestAnimationFrame(animate);
        } else {
            finishLottery(selectedPrize, code);
        }
    }
    
    animate();
}

// 带旋转角度绘制转盘
function drawWheelWithRotation(rotation) {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (prizes.length === 0) {
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    
    const sliceAngle = (Math.PI * 2) / prizes.length;
    
    prizes.forEach((prize, index) => {
        const startAngle = index * sliceAngle + rotation;
        const endAngle = startAngle + sliceAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(prize.name.substring(0, 8), radius - 20, 5);
        ctx.restore();
    });
}

// 根据概率选择奖品
function selectPrizeByProbability() {
    const availablePrizes = prizes.filter(p => p.quantity > 0);
    if (availablePrizes.length === 0) return null;
    
    const totalProbability = availablePrizes.reduce((sum, p) => sum + p.probability, 0);
    let random = Math.random() * totalProbability;
    
    for (const prize of availablePrizes) {
        random -= prize.probability;
        if (random <= 0) {
            // 减少奖品数量
            prize.quantity--;
            savePrizes();
            return prize;
        }
    }
    
    // 如果概率计算有问题，返回第一个可用奖品
    const firstPrize = availablePrizes[0];
    firstPrize.quantity--;
    savePrizes();
    return firstPrize;
}

// 完成抽奖（Firebase 版本）
async function finishLottery(prize, code) {
    isSpinning = false;
    document.getElementById('startBtn').disabled = false;
    
    // 消耗抽奖码
    if (useFirebase && code) {
        const consumed = await consumeCode(code, prize.name);
        if (!consumed) {
            alert('抽奖码消耗失败，但已中奖！请联系管理员');
        }
    }
    
    // 显示结果
    const resultSection = document.getElementById('resultSection');
    const prizeImage = document.getElementById('prizeImage');
    const prizeText = document.getElementById('prizeText');
    
    prizeText.textContent = prize.name;
    
    if (prize.image) {
        prizeImage.src = prize.image;
        prizeImage.style.display = 'block';
    } else {
        prizeImage.style.display = 'none';
    }
    
    resultSection.style.display = 'block';
    
    // 记录抽奖（本地）
    recordDraw(prize);
    
    // 更新奖品列表
    updatePrizesList();
}

// 记录抽奖
function recordDraw(prize) {
    const record = {
        code: '已使用',
        time: new Date().toLocaleString(),
        prize: prize.name
    };
    
    drawRecords.push(record);
    localStorage.setItem('chaowei_records', JSON.stringify(drawRecords));
}

// 重置抽奖
function resetLottery() {
    document.getElementById('resultSection').style.display = 'none';
    currentRotation = 0;
    drawWheel();
}

// 更新奖品列表
function updatePrizesList() {
    const prizesList = document.getElementById('prizesList');
    prizesList.innerHTML = '';
    
    prizes.filter(p => p.quantity > 0).forEach(prize => {
        const prizeItem = document.createElement('div');
        prizeItem.className = 'prize-item';
        
        let imageHtml = '';
        if (prize.image) {
            imageHtml = `<img src="${prize.image}" alt="${prize.name}">`;
        }
        
        prizeItem.innerHTML = `
            ${imageHtml}
            <h4>${prize.name}</h4>
            <p>数量：${prize.quantity}</p>
            <p>概率：${prize.probability}%</p>
        `;
        
        prizesList.appendChild(prizeItem);
    });
}

// 页面卸载时保存
window.onbeforeunload = function() {
    savePrizes();
};