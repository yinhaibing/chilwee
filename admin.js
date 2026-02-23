// 全局变量
let prizes = [];
let lotteryCodes = [];
let drawRecords = [];
let adminVerified = false;
let uploadedImage = null;

// 默认管理密码
const ADMIN_PASSWORD = 'chaowei2026';

// 页面加载时初始化
window.onload = function() {
    loadAllData();
    updateUI();
};

// 加载所有数据
function loadAllData() {
    // 加载奖品
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
    
    // 加载抽奖码
    const savedCodes = localStorage.getItem('chaowei_codes');
    if (savedCodes) {
        lotteryCodes = JSON.parse(savedCodes);
    }
    
    // 加载抽奖记录
    const savedRecords = localStorage.getItem('chaowei_records');
    if (savedRecords) {
        drawRecords = JSON.parse(savedRecords);
    }
}

// 验证管理密码
function verifyAdmin() {
    const codeInput = document.getElementById('adminCode');
    const password = codeInput.value.trim();
    
    if (password === ADMIN_PASSWORD) {
        adminVerified = true;
        document.getElementById('settingsContent').style.display = 'block';
        codeInput.disabled = true;
        alert('验证成功！');
        updateUI();
    } else {
        alert('管理密码错误！');
    }
}

// 添加抽奖码
function addCode() {
    if (!adminVerified) {
        alert('请先验证管理密码！');
        return;
    }
    
    const codeInput = document.getElementById('codeInput');
    const code = codeInput.value.trim();
    
    if (!code) {
        alert('请输入抽奖码！');
        return;
    }
    
    if (lotteryCodes.includes(code)) {
        alert('该抽奖码已存在！');
        return;
    }
    
    lotteryCodes.push(code);
    localStorage.setItem('chaowei_codes', JSON.stringify(lotteryCodes));
    
    codeInput.value = '';
    updateCodesList();
    alert('抽奖码添加成功！');
}

// 删除抽奖码
function deleteCode(code) {
    if (!adminVerified) return;
    
    if (confirm('确定要删除这个抽奖码吗？')) {
        const index = lotteryCodes.indexOf(code);
        if (index > -1) {
            lotteryCodes.splice(index, 1);
            localStorage.setItem('chaowei_codes', JSON.stringify(lotteryCodes));
            updateCodesList();
        }
    }
}

// 更新抽奖码列表
function updateCodesList() {
    const codesList = document.getElementById('codesList');
    codesList.innerHTML = '';
    
    if (lotteryCodes.length === 0) {
        codesList.innerHTML = '<p style="color: #666;">暂无抽奖码</p>';
        return;
    }
    
    lotteryCodes.forEach(code => {
        const codeTag = document.createElement('span');
        codeTag.className = 'code-tag';
        codeTag.innerHTML = `
            ${code}
            <span class="delete-btn" onclick="deleteCode('${code}')">×</span>
        `;
        codesList.appendChild(codeTag);
    });
}

// 预览图片
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${uploadedImage}" alt="预览">`;
        };
        reader.readAsDataURL(file);
    }
}

// 添加奖品
function addPrize() {
    if (!adminVerified) {
        alert('请先验证管理密码！');
        return;
    }
    
    const nameInput = document.getElementById('prizeName');
    const quantityInput = document.getElementById('prizeQuantity');
    const probabilityInput = document.getElementById('prizeProbability');
    
    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value);
    const probability = parseFloat(probabilityInput.value);
    
    if (!name) {
        alert('请输入奖品名称！');
        return;
    }
    
    if (isNaN(quantity) || quantity < 1) {
        alert('请输入有效的奖品数量！');
        return;
    }
    
    if (isNaN(probability) || probability < 0 || probability > 100) {
        alert('请输入有效的中奖概率（0-100）！');
        return;
    }
    
    // 检查总概率
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0) + probability;
    if (totalProbability > 100) {
        alert(`总概率不能超过100%！当前总概率：${totalProbability.toFixed(1)}%`);
        return;
    }
    
    const newPrize = {
        id: Date.now(),
        name: name,
        quantity: quantity,
        probability: probability,
        image: uploadedImage || ''
    };
    
    prizes.push(newPrize);
    localStorage.setItem('chaowei_prizes', JSON.stringify(prizes));
    
    // 清空输入
    nameInput.value = '';
    quantityInput.value = '';
    probabilityInput.value = '';
    document.getElementById('prizeImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    uploadedImage = null;
    
    updatePrizesTable();
    updateProbabilitySummary();
    alert('奖品添加成功！');
}

// 删除奖品
function deletePrize(id) {
    if (!adminVerified) return;
    
    if (confirm('确定要删除这个奖品吗？')) {
        const index = prizes.findIndex(p => p.id === id);
        if (index > -1) {
            prizes.splice(index, 1);
            localStorage.setItem('chaowei_prizes', JSON.stringify(prizes));
            updatePrizesTable();
            updateProbabilitySummary();
        }
    }
}

// 更新奖品表格
function updatePrizesTable() {
    const tableBody = document.getElementById('prizesTableBody');
    tableBody.innerHTML = '';
    
    prizes.forEach(prize => {
        const row = document.createElement('tr');
        
        let imageHtml = '<div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">无图片</div>';
        if (prize.image) {
            imageHtml = `<img src="${prize.image}" alt="${prize.name}">`;
        }
        
        row.innerHTML = `
            <td>${prize.name}</td>
            <td>${imageHtml}</td>
            <td>${prize.quantity}</td>
            <td>${prize.probability}%</td>
            <td>
                <div class="actions">
                    <button class="delete-btn" onclick="deletePrize(${prize.id})">删除</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 更新概率总览
function updateProbabilitySummary() {
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    const totalPrizes = prizes.reduce((sum, p) => sum + p.quantity, 0);
    
    document.getElementById('totalProbability').textContent = totalProbability.toFixed(1) + '%';
    document.getElementById('totalPrizes').textContent = totalPrizes;
    document.getElementById('totalDraws').textContent = drawRecords.length;
}

// 更新抽奖记录表格
function updateRecordsTable() {
    const tableBody = document.getElementById('recordsTableBody');
    tableBody.innerHTML = '';
    
    if (drawRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">暂无抽奖记录</td></tr>';
        return;
    }
    
    // 显示最近100条记录
    const recentRecords = drawRecords.slice(-100).reverse();
    
    recentRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.code}</td>
            <td>${record.time}</td>
            <td>${record.prize}</td>
        `;
        tableBody.appendChild(row);
    });
}

// 导出记录
function exportRecords() {
    if (!adminVerified) return;
    
    if (drawRecords.length === 0) {
        alert('暂无抽奖记录！');
        return;
    }
    
    let csvContent = '抽奖码,中奖时间,奖品\n';
    drawRecords.forEach(record => {
        csvContent += `${record.code},${record.time},${record.prize}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '超威电池抽奖记录_' + new Date().toLocaleDateString() + '.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 清空记录
function clearRecords() {
    if (!adminVerified) return;
    
    if (confirm('确定要清空所有抽奖记录吗？此操作不可恢复！')) {
        drawRecords = [];
        localStorage.removeItem('chaowei_records');
        updateRecordsTable();
        updateProbabilitySummary();
        alert('记录已清空！');
    }
}

// 保存设置
function saveSettings() {
    if (!adminVerified) return;
    
    localStorage.setItem('chaowei_prizes', JSON.stringify(prizes));
    localStorage.setItem('chaowei_codes', JSON.stringify(lotteryCodes));
    
    alert('所有设置已保存！');
}

// 加载设置
function loadSettings() {
    if (!adminVerified) return;
    
    loadAllData();
    updateUI();
    alert('设置已重新加载！');
}

// 重置所有
function resetAll() {
    if (!adminVerified) return;
    
    if (confirm('确定要重置所有设置吗？此操作将清除所有数据，不可恢复！')) {
        localStorage.removeItem('chaowei_prizes');
        localStorage.removeItem('chaowei_codes');
        localStorage.removeItem('chaowei_records');
        
        prizes = [];
        lotteryCodes = [];
        drawRecords = [];
        
        loadAllData();
        updateUI();
        
        alert('所有设置已重置！');
    }
}

// 更新所有UI
function updateUI() {
    updateCodesList();
    updatePrizesTable();
    updateRecordsTable();
    updateProbabilitySummary();
}