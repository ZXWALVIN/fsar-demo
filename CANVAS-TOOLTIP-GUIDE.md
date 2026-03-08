# v5.0-L Canvas 原理解释卡片使用说明

## 🎯 核心功能

在 Canvas 画布内添加了**可点击的信息图标**，点击后显示原理解释悬浮卡片。

## 📍 图标位置

### 传统结构 Canvas（上方）
- **位置**：高速差冲突区（橙色区域）中心上方
- **图标**：橙色圆形，白色问号 `?`
- **功能**：点击显示"高速差摩擦机制"解释卡片

### FSAR结构 Canvas（下方）
- **位置**：真空隔离区（紫色区域）中心上方
- **图标**：紫色圆形，白色问号 `?`
- **功能**：点击显示"真空隔离机制"解释卡片

## 🖱️ 使用方法

1. **打开文件**：在浏览器中打开 `fsar-demo-hightech.html`
2. **定位图标**：
   - 传统结构：找到橙色的"高速差冲突区"，上方有橙色圆形图标
   - FSAR结构：找到紫色的"真空隔离区"，上方有紫色圆形图标
3. **点击图标**：鼠标点击圆形图标
4. **查看卡片**：悬浮卡片会在点击位置附近显示
5. **自动消失**：卡片会在 5 秒后自动消失

## 📋 卡片内容

### 高速差摩擦机制卡片
```
⚠️ 高速差摩擦机制

问题根源：传统平行式加速车道结构中，入口匝道车辆（30km/h）
必须在加速过程中与主线车流（80km/h）竞争间隙。

物理冲突：50km/h的速度差导致主线车辆频繁急刹车，产生
"摩擦内耗"（如图中⚡火花所示）。

容量萎缩：摩擦波向上游传播，形成停车-启动循环，使下游
通行能力从理论值5400pcu/h萎缩至实测值4100pcu/h（-24%）。
```

### 真空隔离机制卡片
```
🛡️ 真空隔离机制

拓扑逆序：FSAR结构将出口匝道前置于入口匝道，在两者之间
设置物理隔离带（紫色区域）。

真空空槽：隔离带后方形成"零干扰加速区"，入口匝道车辆可
在无摩擦环境下自由加速至主线速度。

容量恢复：消除速度差摩擦后，下游通行能力恢复至4980pcu/h
（+21% vs 传统结构），接近理论容量。
```

## 🧪 测试步骤

### 测试1：Canvas 图标测试
1. 打开 `canvas-icon-test.html`
2. 点击橙色圆形图标
3. 观察是否显示 Tooltip 卡片
4. 查看日志输出，确认点击坐标和距离

### 测试2：主文件测试
1. 打开 `fsar-demo-hightech.html`
2. 在传统结构 Canvas 中找到橙色图标（冲突区上方）
3. 点击图标，应显示"高速差摩擦机制"卡片
4. 在 FSAR结构 Canvas 中找到紫色图标（隔离区上方）
5. 点击图标，应显示"真空隔离机制"卡片

## 🔧 技术实现

### 图标绘制
```javascript
// 在 drawTraditionalRoad() 中
const conflictIconX = accelStart + (CONFIG.tradAccelLaneLength * CONFIG.scale) / 2;
const conflictIconY = CONFIG.roadY + CONFIG.laneHeight * 2 - 15;

ctx.fillStyle = 'rgba(243, 156, 18, 0.9)';
ctx.beginPath();
ctx.arc(conflictIconX, conflictIconY, 12, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = '#fff';
ctx.font = 'bold 16px Arial';
ctx.fillText('?', conflictIconX, conflictIconY);
```

### 点击检测
```javascript
tradCanvas.addEventListener('click', function(e) {
    const rect = tradCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const distance = Math.sqrt((x - iconX) ** 2 + (y - iconY) ** 2);
    if (distance < 15) {
        // 显示 Tooltip
        tooltip.classList.add('visible');
    }
});
```

## ⚠️ 故障排查

### 问题1：看不到图标
**检查**：
1. 确认浏览器已加载最新版本（硬刷新：Cmd+Shift+R）
2. 检查 Canvas 是否正常渲染
3. 使用 `canvas-icon-test.html` 验证基础功能

### 问题2：点击无反应
**检查**：
1. 打开开发者工具（F12）查看 Console 是否有错误
2. 确认点击位置在图标范围内（半径 15 像素）
3. 检查 Tooltip 卡片元素是否存在

### 问题3：卡片位置不对
**调整**：
修改 Canvas 点击事件中的卡片位置计算：
```javascript
tooltip.style.left = (rect.left + x + 20) + 'px';  // 调整偏移量
tooltip.style.top = (rect.top + y - 100) + 'px';   // 调整偏移量
```

## 📂 相关文件

- `fsar-demo-hightech.html` - 主文件（包含 Canvas 图标）
- `canvas-icon-test.html` - Canvas 图标测试页面
- `versions/fsar-demo-hightech-v5.0-L.html` - 备份文件

## 🎨 视觉效果

### 图标样式
- **大小**：半径 12 像素
- **颜色**：
  - 传统结构：橙色 `rgba(243, 156, 18, 0.9)`
  - FSAR结构：紫色 `rgba(155, 89, 182, 0.9)`
- **边框**：白色 2px
- **文字**：白色粗体 16px 问号

### 卡片样式
- **宽度**：320px
- **背景**：半透明深色 + 毛玻璃效果
- **边框**：蓝色发光边框
- **动画**：淡入淡出效果
- **显示时长**：5 秒自动消失

## 📊 完成度

✅ Canvas 图标绘制（传统结构）
✅ Canvas 图标绘制（FSAR结构）
✅ 点击事件监听（传统结构）
✅ 点击事件监听（FSAR结构）
✅ Tooltip 卡片显示逻辑
✅ 自动消失定时器
✅ 测试页面创建

## 🚀 下一步

请在浏览器中测试：
1. 打开 `fsar-demo-hightech.html`
2. 寻找 Canvas 上的圆形图标
3. 点击图标查看原理解释卡片
4. 如有问题，请提供截图或错误信息
