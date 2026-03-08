# FSAR Demo 优化总结

## 本次优化内容

### 1. 平滑变道动画（消除抖动闪烁）

**问题**：线性插值导致变道过程生硬、抖动

**解决方案**：
- 使用余弦插值（S型曲线）替代线性插值
```javascript
// 原来
return fromY + (toY - fromY) * this.laneChangeProgress;

// 优化后
const smoothProgress = (1 - Math.cos(this.laneChangeProgress * Math.PI)) / 2;
return fromY + (toY - fromY) * smoothProgress;
```

### 2. 增强防穿模算法

**问题**：车辆之间会发生重叠穿模

**解决方案**：
- `findLeadVehicle`：同时检查目标车道和来源车道
- `checkGapAcceptance`：同时检查正在变道进入目标车道的车辆
- `applyIDMAndMove`：增加严格距离检查，紧急制动逻辑
```javascript
// 增强防穿模：严格距离检查
if (leadVehicle) {
    const actualGap = leadDist - CONFIG.carLength;
    if (actualGap < minSafeDistance) {
        // 紧急制动：距离过近
        vehicle.speed = Math.min(vehicle.speed, Math.max(0, leadVehicle.speed * 0.5));
    } else if (actualGap < minSafeDistance * 2) {
        // 渐进制动
        const maxSafeSpeed = Math.max(0, (actualGap - minSafeDistance) * 0.25 + leadVehicle.speed);
        vehicle.speed = Math.min(vehicle.speed, maxSafeSpeed);
    }
}
```

### 3. 匝道路径与绘制精确对齐

**问题**：车辆行驶路径在匝道画面之外

**解决方案**：使用二次贝塞尔曲线插值，与绘制路径完全对齐

#### FSAR入匝道
```javascript
// 二次贝塞尔曲线插值
const t = smoothProgress;
const oneMinusT = 1 - t;
v.x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * endX;
v.y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * endY;
```

#### 匝道绘制与路径控制点对应
- **FSAR入匝道**：从 `(fsarEntryX - 70, rampEndY + 100)` 经过 `(fsarEntryX - 30, rampEndY + 40)` 到 `(fsarIsolationEnd + 10, isoY + laneHeight/2)`
- **FSAR出匝道**：从 `(exitStartX, exitStartY)` 经过 `(fsarIsolationStart - 10, rampEndY + 35)` 到 `(fsarIsolationStart + 5, rampEndY + 70)`
- **传统入匝道**：从 `(tradAccelLaneStart - 90, rampEndY + tradRampLength)` 经过 `(tradAccelLaneStart - 35, rampEndY + laneHeight*0.7)` 到 `(tradAccelLaneStart + 8, rampEndY + laneHeight*0.4)`

### 4. 强制车道居中

**问题**：部分车辆沿车道线行驶而非居中

**解决方案**：
- `updateLaneChange`：非变道状态强制更新Y坐标
- `applyIDMAndMove`：每帧强制居中（非变道、非匝道状态）
```javascript
if (!vehicle.isChangingLane && !vehicle.onRamp) {
    vehicle.y = CONFIG.roadY + vehicle.lane * CONFIG.laneHeight + CONFIG.laneHeight / 2;
}
```

### 5. 锁定区变道限制

**问题**：车辆在锁定区内突然跳回主干道

**解决方案**：
- 锁定区(`solidLineX`)之后禁止任何变道到最外侧车道
- 取消变道时强制设置正确的Y坐标

## 核心算法改进

### IDM跟驰模型参数
```javascript
idm: {
    aMax: 0.025,           // 最大加速度
    bComfort: 0.05,        // 舒适减速度
    s0: 12,                // 最小间距
    T: 30,                 // 安全时距
    delta: 4,              // 加速指数
    v0Main: 3.0,           // 主线期望速度
    v0Ramp: 0.8,           // 匝道期望速度
    startupAccelFactor: 0.3,
    startupPhaseDuration: 40,
}
```

### FSM状态机（5状态）
1. **APPROACH**：接近预警区
2. **SORTING**：变道博弈区（尝试向内侧车道变道）
3. **DECISION**：临界判定（变道失败确认）
4. **RELIEF**：主动泄压（驶入出匝道）
5. **ZF_MERGE**：零摩擦汇入（从入匝道进入真空空槽）

## 空间布局（从左到右）

```
x=0 ←── 上游车流 ──→ x=350(预警区) → x=580(锁定区) → x=710(出匝道左边) → x=760(隔离区起点) → x=920(真空空槽) → x=950(入匝道) → x=1100
```

## 验证要点

1. ✅ 变道动画平滑无抖动
2. ✅ 车辆不会发生穿模重叠
3. ✅ 车辆沿匝道画面内行驶
4. ✅ 车辆在车道内居中
5. ✅ 锁定区后不能变道到最外侧
6. ✅ 泄压车辆正确进入出匝道
7. ✅ 入匝道车辆正确进入真空空槽
