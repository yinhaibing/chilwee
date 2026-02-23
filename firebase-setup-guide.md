# Firebase 配置指南

## 📋 配置步骤

### 第一步：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 登录 Google 账号（如果没有则注册）
3. 点击"添加项目"
4. 填写项目信息：
   - **项目名称**：`chaowei-lottery`（或任意名称）
   - 不需要 Google Analytics
5. 点击"创建项目"

### 第二步：启用实时数据库

1. 在 Firebase Console 中，点击左侧菜单"构建" → "实时数据库"
2. 点击"创建数据库"
3. 选择位置：选择"中国-上海"（或其他亚洲地区）
4. 安全规则选择：
   - 选择"测试模式"（开发阶段）
   - 或选择"锁定模式"（生产环境）
5. 点击"启用"

### 第三步：获取 Firebase 配置

1. 点击左侧齿轮图标 ⚙️ → "项目设置"
2. 滚动到"您的应用"部分
3. 点击图标 `</>`（Web 应用）
4. 填写应用名称：`chaowei-lottery-web`
5. 点击"注册应用"
6. **复制配置信息**，格式如下：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "chaowei-lottery.firebaseapp.com",
  databaseURL: "https://chaowei-lottery-default-rtdb.firebaseio.com",
  projectId: "chaowei-lottery",
  storageBucket: "chaowei-lottery.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 第四步：配置数据库安全规则

在 Firebase Console → 实时数据库 → 规则 中，设置以下规则：

```json
{
  "rules": {
    "lotteryCodes": {
      ".read": true,
      ".write": true
    },
    "drawRecords": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 第五步：更新配置文件

1. 打开 `firebase-config.js` 文件
2. 将复制的配置信息替换文件中的 `YOUR_XXX` 占位符
3. 保存文件

### 第六步：添加 Firebase SDK

在 `index.html` 和 `admin.html` 的 `<head>` 标签中添加：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

<!-- Firebase 配置 -->
<script src="firebase-config.js"></script>
```

## ✅ 配置完成

配置完成后，系统将具备以下功能：

- ✅ 后台添加的抽奖码实时同步到所有用户
- ✅ 每个抽奖码只能使用一次
- ✅ 抽奖后自动标记为已使用
- ✅ 实时记录抽奖日志
- ✅ 数据自动备份到云端

## 🔐 安全建议

### 生产环境安全规则

```json
{
  "rules": {
    "lotteryCodes": {
      ".read": true,
      "$code": {
        ".write": "auth != null"
      }
    },
    "drawRecords": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📊 数据结构

### lotteryCodes（抽奖码）
```json
{
  "CW2026001": {
    "status": "unused",
    "usedBy": "",
    "usedTime": "",
    "prize": ""
  }
}
```

### drawRecords（抽奖记录）
```json
{
  "record_1234567890": {
    "code": "CW2026001",
    "prize": "一等奖",
    "time": "2026-02-23 10:30:00"
  }
}
```

## 🆘 常见问题

### Q: Firebase 免费额度够用吗？
A: 免费额度：1000次/天并发连接，10GB/月下载，完全够用。

### Q: 数据会丢失吗？
A: Firebase 自动备份，数据可靠性99.9%。

### Q: 可以导出数据吗？
A: 可以，在 Firebase Console 中可以导出 JSON 格式数据。

### Q: 可以添加管理员权限吗？
A: 可以，使用 Firebase Authentication 添加用户认证。

---

© 2026 超威电池 | 超威动力 动力中国