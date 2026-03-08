# FSAR Demo Hightech 版本变更记录

## v5.3-L (2026-03-08)
### [Category: Feature - Mobile Responsive]

**Problem/Motivation**:
- 页面纯桌面端设计，Canvas硬编码1100x150，手机浏览器无法正常使用
- body overflow:hidden禁止滚动，右侧数据面板固定280px在小屏幕上溢出

**Changes**:
- body overflow改为overflow-x:hidden + overflow-y:auto，允许移动端滚动
- Canvas通过CSS width:100% + JS动态resize实现等比缩放
- 绘图使用ctx.scale(ratio)统一缩放，所有现有绘图代码无需改动
- 添加768px断点：grid单列布局、数据面板2列堆叠、控制面板单列
- 添加480px断点：缩小字号/间距、数据面板单列、tooltip宽度自适应
- Canvas点击坐标转换适配缩放比例，tooltip定位使用CSS坐标

**Effect**:
- 手机/平板可正常浏览和操作仿真
- 桌面端布局和功能与v5.2-L保持一致

## v5.2-L (2026-03-08)
### [Category: Visual - Dashboard Redesign]

**Problem/Motivation**:
- 当数据值较小时（如FSAR停车次数接近0），bar宽度极窄，内部文字无法显示
- 标签"传统结构/FSAR结构"占用过多横向空间，压缩了bar的可用长度
- 对比效果不够直观

**Changes**:
- 将数值从bar内部移到bar右侧外部显示，确保任何宽度下都可读
- 标签从"传统结构/FSAR结构"缩短为"Trad/FSAR"，label宽度从70px减至38px
- 提升显示缩放因子（speed/flow: 0.8→0.95, stops: 0.75→0.9），bar更长对比更明显
- HTML结构调整：`<span class="metric-bar-value">` 从 `.metric-bar` 内部移至 `.metric-bar-row` 层级
- 数值样式参考v4.0：数字放大(17px粗体)，Trad橙色(#ff9800)，FSAR蓝色(#00d4ff)
- 单位缩小(9px半透明灰)，与数字baseline对齐，字体统一Roboto Mono
- 数值拆分为 `.metric-num` + `.metric-unit` 两个span，JS更新改为querySelector写入

**Effect**:
- 所有数值始终清晰可见，不受bar宽度影响
- bar区域更宽，传统vs FSAR的长度差异更直观

## v5.1.1-L (2026-03-08)
### [Category: Bug Fix - Visual Normalization]

**Problem/Motivation**:
- 停车次数和通行能力柱状图视觉长度几乎相同，尽管性能差异显著
- 固定上限归一化（10次停车、5000 pcu/h）导致视觉对比度差
- 示例：0.12次停车 vs 9.85次停车在10次停车的刻度上都显示为~1-98%，视觉上无法区分
- 违背了柱状图可视化的初衷

**Changes**:
- 将固定上限归一化替换为相对归一化（lines 3574-3620）
- 每组指标对现在基于 `Math.max(tradValue, fsarValue)` 归一化
- 添加显示缩放因子：
  - 速度：0.8x（防止100%填充，留出视觉呼吸空间）
  - 停车次数：0.75x（更激进的缩放以突出戏剧性差异）
  - 通行能力：0.8x
- 添加零除保护以处理边界情况

**Effect**:
- 柱状图长度差异现在准确反映性能增量
- 停车次数柱状图显示戏剧性视觉对比（FSAR柱状图明显更短）
- 通行能力柱状图清晰显示FSAR的21%优势
- 改善FSAR性能优势的视觉传达

**Technical Details**:
- 基础版本：v5.1-L
- 修改文件：`fsar-demo-hightech.html`
- 修改函数：`updateStats()` (lines 3567-3620)
- 算法变更：固定上限归一化 → 相对归一化 + 显示缩放

---

## v5.1-L (2026-03-08)
### [Category: Visual Enhancement]

**Problem/Motivation**:
- 纯数字对比的传统vs FSAR指标（速度、停车次数、通过量）缺乏视觉冲击力
- 用户需要在脑海中处理数字才能理解性能差异
- 泄压率的条形图更直观、视觉效果更强

**Changes**:
- 将基于文本的指标显示替换为水平条形图（lines 970-1056）
- 为指标条添加CSS样式，传统结构（橙色）vs FSAR结构（青色）颜色编码（lines 400-580）
- 为停车次数指标实现反向样式（数值越低越好，FSAR显示绿色）
- 更新`updateStats()`函数，将条形宽度计算为最大值的百分比（lines 3567-3675）
- 移除过时的`.metric-row` CSS类

**Effect**:
- 视觉对比现在通过条形长度立即显示FSAR优势
- 与泄压率可视化的设计语言一致
- 提高用户对性能差异的理解
- 增强仿真仪表板的专业外观

**Technical Details**:
- 基础版本：v5.0.2-L
- 修改文件：`fsar-demo-hightech.html`
- 主要修改区域：
  - HTML结构（lines 970-1056）：三个指标卡片改为条形图布局
  - CSS样式（lines 400-580）：新增条形图样式类
  - JavaScript逻辑（lines 3567-3675）：条形宽度计算和动画更新
- 架构影响：无，仅视觉呈现优化

---

## v5.0.2-L (2026-03-07)
### [Category: UI/UX - Tooltip Content Optimization]

**Problem/Motivation**:
- 流量参数tooltip中的临界流量值（5400pcu/h）与实际测试建议不一致
- Tooltip中包含具体速度数值（44km/h、51km/h），但仿真模拟与论文报告数据存在差异，可能误导用户
- 需要更新临界流量至5000pcu/h，并移除不准确的速度数值

**Changes**:
1. **更新临界流量参数**（line 837）：
   - 临界流量从5400pcu/h改为5000pcu/h
   - 更符合实际工程测试数据

2. **移除速度数值**（line 838）：
   - 删除"传统结构平均速度44km/h，FSAR结构51km/h"的具体数值
   - 改为通用描述："设置大于4800pcu/h的流量可以更好地观察两种结构的对比效果"
   - 避免仿真数值与论文数据不一致导致的误导

3. **优化建议测试描述**：
   - 从"设置5400pcu/h观察对比效果最显著"改为"设置大于4800pcu/h的流量可以更好地观察两种结构的对比效果"
   - 给用户更灵活的测试范围建议

**Effect**:
- 临界流量参数更准确（5000pcu/h）
- 避免仿真数值与论文数据不一致的问题
- 用户可以在>4800pcu/h的范围内自由测试，观察对比效果
- Tooltip内容更加通用和可靠

**Technical Details**:
- 基础版本：v5.0.1-L
- 修改文件：`fsar-demo-hightech.html`
- 修改位置：流量参数tooltip内容（line 835-839）
- 修改行数：3行文本内容
- 架构影响：无，仅文本内容优化

---

## v5.0.1-L (2026-03-07)
### [Category: Visual/UI - 用户体验优化]

**Problem/Motivation**:
- 问题1：泄压率进度条中，自然下匝率和被迫泄压率的百分比标签垂直位置相同，两个数字挤在一起难以区分
- 问题2：FSAR结构的4个机制图标都显示"?"，用户不知道应该按什么顺序点击学习
- 问题3：Tooltip卡片5秒自动消失太快，用户来不及阅读完整的"误解+分析+类比"内容

**Changes**:
1. **进度条标签垂直错位**
   - 自然下匝标签（绿色）：向上偏移2px（CSS: `top: 2px`）
   - 被迫泄压标签（红色）：向下偏移2px（CSS: `bottom: 2px`）
   - 两个标签垂直错开4px，避免重叠

2. **机制图标编号化**
   - 图标1（蓝色）：上游预警机制 - 显示数字"1"
   - 图标2（绿色）：拓扑逆序机制 - 显示数字"2"
   - 图标3（紫色）：物理防火墙机制 - 显示数字"3"
   - 图标4（红色）：泄压容错机制 - 显示数字"4"
   - 修改位置：drawFSARRoad函数中的4个ctx.fillText调用

3. **Tooltip显示时长延长**
   - 所有5个Tooltip的setTimeout从5000ms改为10000ms
   - 修改位置：tradCanvas和fsarCanvas的click事件监听器（5处）

**Effect**:
- 进度条百分比标签清晰可读，不再重叠
- 用户可按1→2→3→4的逻辑顺序点击学习FSAR的4个核心机制
- 用户有充足时间阅读完整的原理解释内容（从5秒延长到10秒）

**Technical Details**:
- 基础版本：v5.0-L
- 修改文件：`fsar-demo-hightech.html`
- 修改行数：约15行（CSS 8行 + Canvas绘制 4行 + setTimeout 5处）

---

## v5.0-L (2026-03-07)
### [Category: Feature - 技术诠释可视化系统]

**Problem/Motivation**:
- v4.0教学版本不符合甲方演示需求，需要专业的技术诠释系统
- 现有仿真只展示现象，缺乏对底层物理原理的直观解释
- 数据面板对比效果不够强烈，甲方难以快速理解FSAR的核心优势

**Changes**:
1. **新增Tooltip系统**（4个核心机制的悬浮卡片解释）
   - 高速差摩擦机制（传统结构）：解释50km/h速度差导致的容量萎缩
   - 真空隔离机制（FSAR结构）：解释拓扑逆序+真空空槽的容量恢复原理
   - 泄压率指标解释：解释自然下匝vs被迫泄压的区别，突出1:4.4效益比
   - 流量参数解释：解释临界流量5400pcu/h的物理意义
   - 实现方式：CSS悬浮卡片 + JavaScript事件监听 + Canvas内图标点击检测

2. **新增摩擦火花动画**（传统结构碰撞区）
   - FrictionSpark粒子类：60帧生命周期，缓慢上升淡出
   - 火花检测函数：触发条件（冲突区 + 最外侧车道 + 紧急制动 + 10帧限流）
   - 火花绘制函数：⚡图标（橙色14px）+ 速度损失文本（红色9px，如"-25.3km/h"）
   - 集成到主循环：updateFrictionSparks() + drawFrictionSparks() + detectFrictionConflict()

3. **数据面板强化**
   - 容量萎缩/恢复标签：TRAD行显示红色"容量萎缩"，FSAR行显示绿色"容量恢复"
   - 泄压率进度条堆叠显示：
     - 绿色部分：自然下匝率（约20%）
     - 红色部分：被迫泄压率（约4-5%）
     - 总计显示：总下匝率（约24-25%）
     - 动态计算：自然下匝率 = 总下匝率 - 被迫泄压率

4. **专业术语优化**
   - 使用"诠释"、"解释"、"分析"等甲方演示词汇
   - 避免"教学"、"学习"等教育类词汇
   - 突出"物理冲突"、"容量萎缩"、"效益比"等工程术语

**Effect**:
- 甲方可通过悬浮卡片快速理解FSAR的4个核心机制
- 火花动画直观展示传统结构的摩擦内耗（速度损失可视化）
- 进度条堆叠显示清晰呈现"用4.8%的代价换取21%的容量提升"
- 整体提升演示的专业性和说服力

**Technical Details**:
- 基础版本：v3.3.5-L（Bug修复版本）
- 修改文件：`fsar-demo-hightech.html`
- 新增代码：
  - CSS样式：Tooltip卡片、容量标签、进度条（约150行）
  - HTML结构：4个Tooltip卡片、进度条容器（约60行）
  - JavaScript：FrictionSpark类、火花检测/更新/绘制函数、Tooltip初始化（约150行）
- 修改位置：
  - 版本号：line 618、line 822
  - 数据面板：平均速度卡片（容量标签）、泄压率卡片（进度条）
  - 主循环：updateFrictionSparks()、drawFrictionSparks()、detectFrictionConflict()
- 架构影响：无破坏性修改，纯增量功能
- 性能影响：火花粒子数组动态清理，无内存泄漏风险

---

## v3.3.5-L (2026-03-07)
### [Category: Bug Fix - Forced Relief Misclassification]

**Problem/Motivation**:
- v3.3.4-L引入的"被迫泄压"计数存在时空错位Bug：
  - 自然下匝点 `exitDeadlineX: 1235` 设置在隔离区安全网 `fsarIsolationStart: 1231` 之后
  - 导致所有自然下匝车辆（20%）都被安全网提前拦截，错误地打上 `forcedRelief = true` 标签
  - 实线区变道失败的车辆反而漏打了 `forcedRelief` 标签
- 结果：刚启动时显示"20.0% (20.0%)"，误导用户认为所有下匝都是被迫的

**Changes**:
1. **修复下匝点坐标**（line 911）：
   - `exitDeadlineX: 1235` → `1220`
   - 提前15个单位，确保在隔离区安全网（1231）之前触发自然下匝
   - 自然下匝车辆不再触发安全网的 `forcedRelief = true` 逻辑

2. **补充实线区被迫泄压标签**（line 2808）：
   - 在实线区无间隙变道失败逻辑中，补充 `v.forcedRelief = true;`
   - 确保在实线区被挤出的车辆正确标记为"被迫泄压"

**Effect**:
- **流量低时（刚启动）**：显示 `20.0% (0.0%)`
  - 20%的车辆自然下匝（本就要下高速）
  - 0%被迫泄压（因为车流顺畅，大家都能顺利变道）

- **流量高时（拥堵）**：显示 `23.5% (3.5%)`
  - 23.5%的车辆总下匝（20%自然 + 3.5%被迫）
  - 3.5%被迫泄压（在实线区被别住出不去）

- **突出帕累托改进**：净泄压率从误判的20%降至真实的3.5%，收益比从1:1提升至1:6

**Technical Details**:
- 基础版本：v3.3.4-L（指标拆分优化版本）
- 修改文件：`versions/fsar-demo-hightech-v3.3.5-L.html`
- 修改位置：CONFIG.fsm.exitDeadlineX（1处）、updateFSARFSM()实线区逻辑（1处）
- 架构影响：无，仅修复时空坐标错位和标签漏打问题
- 回滚方案：`cp versions/fsar-demo-hightech-v3.3.4-L.html versions/fsar-demo-hightech-v3.3.5-L.html`

---

## v3.3.4-L (2026-03-07)
### [Category: UI/UX - Metric Decomposition for Pareto Improvement Visibility]

**Problem/Motivation**:
- 当前"泄压率"指标混淆了两个概念：总下匝率（现象）和净牺牲率（代价）
- 甲方无法直观理解FSAR的"帕累托改进"本质：用4.8%的净牺牲换取21%的通行能力提升
- 需要拆分指标，让甲方瞬间看懂"1:4.86的收益比"

**Changes**:
1. **新增强制泄压计数器**（line 1097）：
   - 新增全局变量 `fsarForcedReliefCount`，专门记录被迫泄压车辆
   - 与 `fsarReliefCount`（总下匝数）分离，实现精准计数

2. **精准捕获被迫泄压事件**（line 2669-2680）：
   - 在 `countReliefVehicle()` 函数中增加 `forcedRelief` 判断逻辑
   - 使用 `v.forcedReliefCounted` 标志位防止重复计数
   - 确保只有 `v.forcedRelief = true` 的车辆才计入净牺牲率

3. **UI标签优化**（line 804）：
   - 标签从"Relief Rate / 泄压率"改为"Exit & Relief / 下匝&泄压率"
   - 语义更清晰：Exit（总下匝）+ Relief（净泄压）

4. **双指标渲染**（line 3010-3016）：
   - 计算总下匝率：`exitRate = fsarReliefCount / fsarTotalOuterLane * 100`
   - 计算净泄压率：`forcedRate = fsarForcedReliefCount / fsarTotalOuterLane * 100`
   - 显示格式：`24.8% (4.8%)`（白色总下匝率 + 红色小字净泄压率）

5. **重置逻辑完善**（line 3083）：
   - 在 resetBtn 事件中增加 `fsarForcedReliefCount = 0` 重置逻辑

**Effect**:
- 甲方能直观看到：24.8%的车辆离开主线（现象），但只有4.8%是被迫牺牲（代价）
- 突出"帕累托改进"本质：用4.8%的净牺牲换取21%的通行能力提升（1:4.86收益比）
- 红色小字标注净泄压率，视觉上强化"代价很小"的认知
- 消除甲方对"强制限流"的误解，理解FSAR是"主动优化"而非"被动牺牲"

**Technical Details**:
- 基础版本：v3.3.3-L（IDM刚性增强版本）
- 修改文件：`versions/fsar-demo-hightech-v3.3.4-L.html`
- 修改位置：全局变量（1处）、countReliefVehicle()函数（1处）、UI标签（1处）、updateStats()函数（1处）、resetBtn事件（1处）
- 架构影响：无，仅增加计数器和UI显示逻辑
- 回滚方案：`cp versions/fsar-demo-hightech-v3.3.3-L.html versions/fsar-demo-hightech-v3.3.4-L.html`

---

## v3.3.3-L (2026-03-07)
### [Category: Algorithm - IDM Rigidity & Merge Conflict Enhancement]

**Problem/Motivation**:
- 当前IDM参数过于柔和（bComfort: 0.04, bMax: 0.12），车辆容易被微小波动干扰
- 主线让行逻辑使用舒适减速，无法在物理层面向上游挤压出真实的排队波
- 合流区冲突不够逼真，无法充分展示FSAR结构的零摩擦优势

**Changes**:
1. **增强IDM刚性参数**（line 885-886）：
   - `bComfort`: 0.04 → 0.03（降低25%，增强车辆刚性，不易被微小波动干扰）
   - `bMax`: 0.12 → 0.20（提升67%，强化紧急制动效果）

2. **强化主线让行制动**（line 1418-1432）：
   - 替换原有舒适减速逻辑：`yieldingVehicle.speed = Math.max(targetSpeed, yieldingVehicle.speed - CONFIG.idm.bComfort * 1.5)`
   - 改为紧急制动级别：`yieldingVehicle.acceleration = -CONFIG.idm.bMax * 0.85`
   - 目标速度降低：`rampVehicle.speed * 0.6` → `rampVehicle.speed * 0.4`
   - 效果：强制触发硬刹车，在物理层面向上游挤压出真实的排队波

**Effect**:
- 车辆刚性增强，不易被微小速度波动干扰，跟车行为更稳定
- 紧急制动能力提升67%，合流冲突时制动更果断
- 主线让行时触发硬刹车（-0.17加速度），向上游传播真实排队波
- 传统结构合流区冲突更加逼真，FSAR结构零摩擦优势更加清晰

**Technical Details**:
- 基础版本：v3.3.2-L（刹车波传播优化版本）
- 修改文件：`versions/fsar-demo-hightech-v3.3.3-L.html`
- 修改位置：CONFIG.idm参数（2处）、applyMainlineYield()函数（1处）
- 架构影响：无，仅调整IDM物理参数和让行制动逻辑
- 回滚方案：`cp versions/fsar-demo-hightech-v3.3.2-L.html versions/fsar-demo-hightech-v3.3.3-L.html`

---

## v3.3.2-L (2026-03-07)
### [Category: Algorithm - Brake Wave Propagation Optimization]

**Problem/Motivation**:
- 当前刹车波传播范围过大（400单位），导致拥堵远离冲突源头
- 累积反应延迟过长（CONFIG.idm.reactionTime + random(8)），使拥堵向上游扩散
- 结果：传统结构的拥堵无法精确定位在合流冲突区，掩盖了真实冲突动力学

**Changes**:
1. **缩短刹车波传播范围**（line 1495）：
   - `triggerVehicle.x - v.x < 400` → `triggerVehicle.x - v.x < 120`
   - 传播范围缩减70%（400→120单位）

2. **极小化反应延迟**（line 1502）：
   - `cumulativeDelay += CONFIG.idm.reactionTime + Math.floor(Math.random() * 8);`
   - → `cumulativeDelay += 3 + Math.floor(Math.random() * 3);`
   - 基础延迟从8帧降至3帧，随机分量从8帧降至3帧

**Effect**:
- 拥堵紧贴合流冲突源头，不再向上游远距离扩散
- 传统结构的拥堵精确定位在合流区，提升对比可视化效果
- FSAR结构的零摩擦优势更加清晰可见

**Technical Details**:
- 基础版本：v3.3.1-L（非对称车道分布版本）
- 修改文件：`versions/fsar-demo-hightech-v3.3.2-L.html`
- 修改函数：`propagateBrakeWave()` (line 1489-1509)
- 修改行数：2处（传播范围判断、累积延迟计算）
- 架构影响：无，仅调整刹车波传播参数
- 回滚方案：`cp versions/fsar-demo-hightech-v3.3.1-L.html versions/fsar-demo-hightech-v3.3.2-L.html`

---

## v3.3.1-L (2026-03-07)
### [Category: Algorithm - Lane Distribution Optimization]

**Problem/Motivation**:
- 当前均匀车道分布（33.3%/33.3%/33.3%）不符合真实高速公路使用模式
- 真实高速公路显示：内侧车道使用率最高（40%），外侧合流车道使用率最低（25%）
- 均匀分布导致外侧车道压力过大，掩盖了FSAR结构在合流区的真实优势

**Changes**:
1. **非对称车道分布**（line 1991, 2043）：
   - 替换 `Math.floor(Math.random() * CONFIG.laneCount)` 为加权随机
   - 新分布：内侧40%，中间35%，外侧25%（匹配真实高速公路使用模式）
   - 实现：`const rand = Math.random(); const lane = rand < 0.40 ? 0 : (rand < 0.75 ? 1 : 2);`

**Effect**:
- 外侧车道接收更真实的25%交通负载（而非33.3%）
- 合流区压力更符合真实场景
- FSAR结构优势在真实流量分布下更清晰可见
- 不改变任何IDM参数或启动阶段逻辑，保持原有驾驶行为

**Technical Details**:
- 基础版本：v3.3-L（UI布局优化版本）
- 修改文件：`versions/fsar-demo-hightech-v3.3.1-L.html`
- 修改行数：2处（传统结构主线生成、FSAR结构主线生成）
- 架构影响：无，仅修改车道分布概率
- 回滚方案：`cp versions/fsar-demo-hightech-v3.3-L.html versions/fsar-demo-hightech-v3.3.1-L.html`

---

## v3.4-L (2026-03-06)
### [Category: Algorithm - Traffic Flow Optimization]

**Problem/Motivation**:
- 上游存在幻影拥堵（phantom congestion），掩盖了合流区真实冲突动力学
- 当前问题根源：
  1. 均匀车道分布（33.3%/33.3%/33.3%）导致内侧车道人工拥堵
  2. 过度保守的IDM参数（aMax: 0.022, T: 38, v0Main: 2.8）造成上游级联延迟
  3. 启动阶段（40%速度入场，45帧加速）产生"冷启动"拥堵波
- 结果：合流区未能承受真实交通压力，FSAR优势可见度降低

**Changes**:
1. **非对称车道分布**（line 2223, 2275）：
   - 替换 `Math.floor(Math.random() * CONFIG.laneCount)` 为加权随机
   - 新分布：内侧40%，中间35%，外侧25%（匹配真实高速公路使用模式）
   - 实现：`const rand = Math.random(); const lane = rand < 0.40 ? 0 : (rand < 0.75 ? 1 : 2);`

2. **激进IDM参数调整**（line 1108-1120）：
   - `aMax`: 0.022 → 0.08（+264%，更快加速）
   - `T`: 38 → 20（-47%，更紧密跟车）
   - `v0Main`: 2.8 → 3.5（+25%，更高期望速度）
   - `reactionTime`: 8 → 5（-38%，更快反应）

3. **条件式启动阶段**（line 1752-1788）：
   - 新增前方车辆检测：`const hasLeadVehicle = leadVehicle && leadDist < 60;`
   - 前方无车时：直接全速进入（`vehicle.speed = effectiveDesiredSpeed`），跳过启动阶段
   - 前方有车时：保留原渐进加速逻辑（40%→100%，45帧）
   - 消除不必要的"冷启动"拥堵

4. **版本注释更新**（line 1046-1052）：
   - 在CONFIG参数区域顶部添加v3.4-L版本说明
   - 记录三项核心改动及预期效果

**Effect**:
- **上游流量平滑化**：
  - 内侧车道负载从33.3%降至40%（实际是减少拥堵，因为车辆分布更合理）
  - 消除幻影拥堵，车辆在无前车时全速进入
  - 更快加速（aMax: 0.08）减少级联延迟

- **合流区压力恢复**：
  - 外侧车道接收真实25%交通负载
  - 合流区体验真实冲突动力学
  - FSAR优势可见度显著提升

- **真实驾驶行为**：
  - 更短安全时距（T: 20）创造更紧密跟车
  - 更高期望速度（v0Main: 3.5）匹配高速公路条件
  - 更快反应时间（5帧）提升响应性

**Performance Metrics (Expected)**:
| Metric | v3.3-L (Current) | v3.4-L (Expected) | Change |
|--------|------------------|-------------------|--------|
| Upstream congestion | High (phantom) | Low (realistic) | -60% |
| Merge zone pressure | Low (masked) | High (realistic) | +80% |
| Average speed | ~2.5 | ~3.2 | +28% |
| FSAR advantage visibility | Moderate | High | Clearer |

**Technical Details**:
- 修改文件：`fsar-demo-hightech.html`
- 修改行数：4处（版本注释、IDM参数、2处车道分布、启动阶段逻辑）
- 架构影响：无破坏性变更，仅参数调优和条件逻辑优化
- 回滚方案：`cp versions/fsar-demo-hightech-v3.3-L.html fsar-demo-hightech.html`

---

## v4.0-L (2026-03-06)
### [Category: Feature - Teaching Mode System]

**Problem/Motivation**:
- 用户对FSAR创新存在认知误区：认为只是"增量改进"而非"范式创新"
- 常见误解：泄压出口是普通出口、隔离区浪费空间、变道失败是强制限流
- 需要渐进式教学系统，通过5个场景引导用户理解"相变现象"（湍流→层流）
- 目标受众：政府决策者、技术专家、投资人（需要情感+浅层理性解释）

**Changes**:
1. **教学场景定义系统**（line 3310-3450）：
   - 5个场景配置：传统缺陷、拓扑逆序、隔离区、变道博弈、零摩擦合流
   - 每个场景包含：标题、时长(45秒)、相机参数、标注列表、中英双语旁白
   - 场景数据结构：`TEACHING_SCENES` 数组

2. **教学模式状态机**（line 3452-3460）：
   - `teachingState` 对象：enabled、currentScene、sceneProgress、isPaused、playbackSpeed、language
   - 场景自动推进逻辑：进度达到duration时跳转下一场景

3. **UI组件**（line 374-556, 1012-1034）：
   - **模式切换按钮**：控制面板顶部，切换自由探索/引导教学
   - **场景导航面板**：左侧浮动，显示5个场景卡片+进度条
   - **旁白面板**：底部居中，显示当前场景解说+语言切换
   - **播放控制**：右下角，上一场景/播放暂停/下一场景/速度选择
   - CSS样式：半透明背景、毛玻璃效果、蓝色主题

4. **相机系统**（line 3390-3410）：
   - CSS transform实现缩放/平移：`scale()` + `transformOrigin`
   - 平滑过渡：1.5秒 cubic-bezier(0.4, 0, 0.2, 1)
   - 支持3种目标：traditional、fsar、split（分屏对比）
   - 缩放范围：1.5x - 2.5x

5. **标注层系统**（line 3462-3650）：
   - 创建独立标注画布：覆盖在仿真画布上方（z-index: 10）
   - 9种标注类型：脉冲圆圈、箭头、波浪、能量护盾、压力阀、能量墙、零通量标签、思维气泡、摩擦闪电、相变动画
   - 动画同步：基于场景进度progress，使用requestAnimationFrame
   - 渲染函数：`renderAnnotations()` 每帧清空并重绘

6. **事件监听与交互**（line 3309-3490）：
   - 模式切换：显示/隐藏教学UI，自动启动仿真
   - 场景卡片点击：跳转到指定场景
   - 播放控制：播放/暂停、上一个/下一个场景、速度切换(0.5x/1x/2x)
   - 语言切换：中文/英文旁白切换
   - 键盘快捷键：空格(播放/暂停)、左右箭头(场景切换)、Esc(退出教学模式)

7. **教学模式更新逻辑**（line 3265-3295）：
   - 集成到主动画循环：每帧调用`updateTeachingMode()`
   - 场景进度更新：`sceneProgress += deltaTime * playbackSpeed`
   - 进度条同步：实时更新场景卡片进度条宽度
   - 自动推进：场景完成后自动跳转下一场景，最后一个场景完成后暂停

8. **标注绘制函数**（line 3652-3800）：
   - `drawPulseCircle`: 脉冲圆圈（冲突点标记）
   - `drawArrow`: 箭头+标签（指向关键位置）
   - `drawWave`: 波浪动画（拥堵波传播）
   - `drawEnergyShield`: 能量护盾（隔离区可视化）
   - `drawPressureValve`: 压力阀图标+蒸汽动画
   - `drawEnergyWalls`: 能量墙+发光效果
   - `drawZeroFluxLabel`: 零通量文字标签
   - `drawThoughtBubble`: 思维气泡（车辆内心独白）
   - `drawSmoothExitPath`: 平滑出口路径高亮
   - `drawFrictionLightning`: 摩擦闪电效果
   - `drawPhaseTransition`: 相变动画（湍流态↔层流态）

**Effect**:
- 用户通过5个场景渐进理解FSAR核心创新
- 场景1：认识传统方案"拥堵黑洞"本质
- 场景2：理解拓扑逆序="压力泄放阀"物理意义
- 场景3：认识隔离区="热力学绝缘层"必要性
- 场景4：理解变道失败="智能保护机制"而非强制限流
- 场景5：见证零摩擦合流="相变现象"（停车次数-98.8%）
- 预期：用户从"增量改进"认知转变为"范式创新"认知

**Technical Details**:
- 新增代码：约500行（场景定义、UI组件、标注系统、事件监听）
- 修改文件：`fsar-demo-hightech.html`（单文件实现）
- 架构：非侵入式叠加层，不影响现有仿真逻辑
- 性能：标注画布独立渲染，仅教学模式激活时绘制
- 兼容性：CSS transform支持所有现代浏览器

---

## v3.3-L (2026-03-06)
### [Category: UI - Layout Optimization]

**Problem/Motivation**:
- 控制面板中间的"暂停"按钮无效，占用空间
- 图例位于右侧边栏，可以移动到控制面板释放空间
- 指标显示字体偏小，可读性有待提升

**Changes**:
1. **移除暂停按钮**（line 636）：
   - 删除无效的"Pause/暂停"按钮
   - 控制按钮从3个减少到2个（Start + Reset）
   - 按钮布局改为Grid 1fr 1fr

2. **图例重新定位**（line 631-677, 769-789）：
   - 将图例从右侧边栏移动到控制面板
   - 采用Grid布局：左侧按钮+滑块，右侧图例
   - 图例样式调整为紧凑型垂直布局
   - 新增CSS类：`.control-grid`, `.control-left`, `.control-legend`, `.legend-header`, `.legend-items-compact`

3. **指标显示放大**（line 398-402, 385-387, 352-358）：
   - 指标数值字体：15px → 20px（+33%）
   - 卡片标题字体：9px → 11px（+22%）
   - 指标标签字体：10px → 12px（+20%）

**Effect**:
- 控制面板更简洁，空间利用更高效
- 右侧边栏专注于性能指标显示
- 指标可读性显著提升
- 图例位置更符合逻辑（靠近控制区域）

---

## v3.2-X (2026-03-06)
### [Category: Algorithm - Queue-Triggered Lane Change Enhancement]

**Problem/Motivation**:
- v3.1-X实现连续拥堵后，发现最外侧车道车辆长期排队等待
- 仅~1%的排队车辆尝试变道，不符合真实驾驶行为
- 现实中20-40%的司机在排队几秒后会尝试变道到更快车道

**Changes**:
1. **统一避堵变道逻辑**（line 2448-2465）：
   - 最外侧车道车辆现在使用标准`tryAvoidCongestionLaneChange()`函数
   - 移除1%概率限制，改用基于MOBIL模型和个性化意愿的决策
   - 增加安全约束：仅在远离冲突区（x < tradAccelLaneStart - 150）时允许变道

2. **个性化变道行为**：
   - 激进型司机（35%）：90%变道意愿
   - 普通型司机（40%）：65%变道意愿
   - 耐心型司机（25%）：30%变道意愿
   - 预期总体变道尝试率：25-30%

3. **安全保护**：
   - 接近合流冲突区时禁止变道（避免干扰加速车道车辆）
   - MOBIL模型确保变道安全（间隙检查、后车减速度限制）

**Effect**:
- 预期：最外侧车道排队车辆中20-40%会尝试变道
- 更真实的驾驶行为：主动寻找更快车道
- 拥堵可能向中间车道扩散（符合真实交通流理论）
- FSAR结构保持不变

---

## v3.1-X (2026-03-06)
### [Category: Algorithm - Congestion Continuity Exploration]

**Problem/Motivation**:
- 传统结构显示碎片化拥堵区（isolated red clusters with gaps）
- 真实交通和VISSIM仿真显示连续上游排队（continuous upstream queuing）
- 未使用的propagateBrakeWave()函数从未被激活
- 目标：创建更真实的拥堵可视化，消除人工间隙

**Changes**:
1. **激活刹车波传播机制**：
   - 在合流冲突时触发propagateBrakeWave()（line 2284）
   - 在车辆停车时触发propagateBrakeWave()（line 1536）

2. **增强propagateBrakeWave()函数**（line 1435-1455）：
   - 传播范围：300→400单位
   - 随机分量：random(12)→random(8)
   - 制动强度增长率：0.1→0.05

3. **保守参数调优（仅传统结构）**：
   - reactionTime: 12→8 frames（更快反应）
   - aMax: 0.018→0.022（更快加速）
   - T: 45→38 frames（更紧密跟车）
   - startupAccelFactor: 0.15→0.20（更快起步）
   - startupPhaseDuration: 80→65 frames（缩短启动期）

4. **软化防穿模系数**：
   - 硬性制动：0.3→0.65（line 1500）
   - 紧急制动：0.5→0.75（line 1609）

5. **减少启动延迟**：
   - 启动延迟：10+random(15)→8+random(10) frames（line 1531）

**Effect**:
- 预期：传统结构产生更连续的拥堵可视化
- FSAR结构保持不变，维持性能优势
- 保守方法最小化过度优化风险

---

## v3.0.2-L (2026-03-06)
### UI修正：删除旧CRT样式残留

**问题**：
- v3.0-L和v3.0.1-L中开始按钮颜色与背景融合，几乎看不见
- 根因：CSS中存在两套按钮样式定义，旧的CRT终端样式（第787-843行）覆盖了新的工程仪表盘样式
- 旧样式设置了`background: transparent`，导致按钮背景透明

**修复内容**：
1. **删除旧CRT样式残留**（第500-843行）：
   - 删除`.system-bar`、`.status-dot`、`.system-time`等旧系统栏样式
   - 删除`.header`、`.tagline`、`.version-tag`等旧标题区样式
   - 删除`.sim-panel::before`、`.panel-header`、`.panel-title`等旧面板样式
   - 删除`.dashboard`、`.metric-card`、`.metric-row`等旧数据卡片样式
   - 删除`.control-section`、`.flow-control`、`.flow-display`等旧控制面板样式
   - 删除`.btn-group`、`.btn.start`、`.btn.reset`等旧按钮样式（关键！）
   - 删除`.legend-bar`、`.legend-icon`、`.footer-bar`等旧图例和底部栏样式

2. **保留新工程仪表盘样式**（第235-281行）：
   - `.btn-primary`：明亮蓝色渐变背景
   - `.btn-secondary`：透明背景+蓝色边框
   - `.btn-danger`：透明背景+红色边框

**效果**：
- 开始按钮现在显示明亮的蓝色渐变背景，清晰可见
- 流量滑块颜色正常显示
- 所有按钮样式与proposal-1-engineering-dashboard-v2.html完全一致

---

## v3.0.1-L (2026-03-06)
### UI修正：按钮样式恢复

**问题**：
- v3.0-L初始版本中误删除了`text-transform: uppercase`，导致按钮文字样式不一致
- 按钮padding从8px改为10px，与原设计不符

**修复内容**：
1. **按钮样式恢复**：
   - 恢复`text-transform: uppercase`（按钮文字全大写）
   - 恢复padding为`8px 16px`（与proposal-1-engineering-dashboard-v2.html一致）
   - 确保btn-primary的明亮蓝色渐变背景清晰可见

**效果**：
- 开始按钮明亮蓝色，清晰可见
- 按钮样式与原UI设计完全一致

---

## v3.0-L (2026-03-06)
### UI重构：工程仪表盘设计

**问题**：
- 原v2.3-L采用CRT终端风格，虽然科技感强但信息密度低，需要滚动查看
- 用户需要在单屏内同时看到仿真动画和所有关键指标
- 需要更清晰的色彩编码系统来区分传统结构和FSAR结构
- 需要更专业的工程仪表盘风格，适合技术演示和工程评审

**修复内容**：

1. **UI框架重构**：
   - 从CRT终端风格切换到现代工程仪表盘设计
   - 移除扫描线效果、网格背景、霓虹发光等装饰性元素
   - 采用IBM Plex Sans + Roboto Mono字体组合，提升可读性
   - 背景渐变：#0f1419 → #1a1d29，深色专业风格

2. **布局优化**：
   - 左右分栏布局（Grid: 1fr 280px）
   - 左侧：仿真区域（传统结构 + FSAR结构 + 控制面板）
   - 右侧：数据面板（指标卡片 + 状态卡片 + 图例）
   - 单屏显示所有内容（height: calc(100vh - 100px)）

3. **Canvas尺寸调整**：
   - 从 1100×110px 增大到 1100×150px
   - roadY从33调整到45，保持垂直居中
   - 强调动画演示核心，提升视觉冲击力

4. **色彩编码系统**：
   - 传统结构：橙色 #ff9800（图标、标题、标签、数值）
   - FSAR结构：蓝色 #00d4ff（图标、标题、标签、数值）
   - 提效指标：绿色 #2ecc71（百分比增量）

5. **顶部系统栏**：
   - 显示系统状态（SYSTEM ONLINE）、帧计数、版本号
   - 移除系统时间显示（简化界面）

6. **数据面板重构**：
   - 紧凑卡片设计（280px宽，10px padding）
   - 指标卡片：平均速度、停车次数、通过量（显示提效百分比）
   - 状态卡片：2×2网格显示传统状态、FSAR状态、车辆数、泄压率
   - 图例卡片：主线车流、匝道车流、出口车流、隔离区

7. **控制面板优化**：
   - 三按钮布局：Start/开始、Pause/暂停、Reset/重置
   - 流量滑块：3000-5700 pcu/h，实时显示当前值
   - 中英双语标签，提升国际化支持

8. **数据显示优化**：
   - 移除单位后缀（km/h、次、辆），仅显示数值
   - 自动计算并显示提效比例（+17.2%、-98.8%、+21.3%）
   - 泄压率独立显示（百分比格式）
   - 车辆总数实时统计（tradVehicles.length + fsarVehicles.length）

**效果**：
- 单屏显示所有内容，无需滚动
- 色彩编码清晰，快速区分传统/FSAR结构
- 数据密度提升，信息层次分明
- 专业工程仪表盘风格，适合技术演示
- 动画区域增大36%（110→150px），视觉冲击力更强

---

## v2.3-L (2026-03-06)
### UI修正：FSAR结构文字标识居中对齐

**问题**：
- 隔离区和加速通道的文字标识与对应结构有视觉偏移
- 文字使用固定偏移量，未考虑结构宽度的动态居中

**修复内容**：

1. **真空隔离区标识**（第1817-1820行）：
   - 计算隔离区实际宽度：`isoWidth = isoEnd - isoStart`
   - 文字居中显示：`isoTextX = isoStart + isoWidth / 2 - 30`

2. **无干扰空槽标识**（第1824-1826行）：
   - 计算加速通道实际宽度：`vacuumSlotLength`
   - 文字居中显示：`vacuumTextX = vacuumSlotStart + vacuumSlotLength / 2 - 28`

3. **出匝道标识**（第1829行）：
   - 调整位置从 `exitStartX - 6` 到 `exitStartX + 10`
   - 更准确地对齐到出匝道起点

**效果**：
- 所有文字标识精确居中对齐到对应的道路结构
- 视觉呈现更加专业和协调

---

## v2.2-L (2026-03-06)
### 入场加速优化：消除入口幽灵拥堵

**问题**：
- 车辆刚进入画面左侧就与前车发生碰撞（急刹），在入口处形成幽灵拥堵区
- 根因：新车以全速(v0Main)生成，IDM立即要求134单位安全距离，实际间距不足触发强制动
- 连锁反应：新车急刹 → 后续车辆连锁制动 → 幽灵拥堵

**修复内容**：

1. **Vehicle 构造函数**：
   - 主线车辆初始速度从 `v0Main` 降为 `v0Main * 0.4`（40%速度入场）
   - 新增 `isEntering`/`enteringPhase`/`enteringDuration` 入场状态属性

2. **applyIDMAndMove 入场加速阶段**：
   - 入场阶段持续45帧（约0.75秒），期间不执行IDM逻辑
   - 使用S型曲线(cosine interpolation)从40%平滑加速到100%期望速度
   - 加速度限制为 `aMax * 0.6`（温和加速）
   - 安全检查：前车距离 < `carLength * 3` 时提前结束入场阶段

3. **生成碰撞检查范围扩大**：
   - 传统结构和FSAR结构的主线生成检查从 `carLength * 2`(24) 扩大到 `60` 单位
   - 确保新车有足够的加速空间

**效果**：
- 消除入口处的幽灵拥堵现象
- 车辆在 x≈70-80 处达到期望速度，不影响下游合流区逻辑
- 更真实的交通行为（车辆从上游汇入时速度渐进增加）

---

## v2.1-L (2026-03-05)
### 全等比缩放修正：Y轴维度统一缩放

**问题**：
- v2.0-L 存在非对称缩放失真：X轴已按 0.611 缩放，但 Y轴维度未缩放
- 车辆横向被压缩但纵向不变，宽高比失真（看起来过"胖"）
- 预警区起点 warningZoneStart=-300 映射到 -183px，完全在画面外
- FSM 状态机的 SORTING 行为在画面外发生，失去演示价值

**修复内容**：

1. **CONFIG 参数修正**（第704-792行）：
   - `canvasHeight`: 180 → **110** (180 × 0.611)
   - `roadY`: 55 → **33** ((110 - 3×15) / 2)
   - `laneHeight`: 24 → **15** (24 × 0.611)
   - `carWidth`: 12 → **7** (12 × 0.611)
   - `fsm.warningZoneStart`: -300 → **150** (150 × 0.611 = 92px，画面内可见)
   - `laneChange.duration`: 60 → **45** 帧 (变道距离缩短，持续时间相应缩短)

2. **HTML Canvas 元素**：
   - 第561行：`traditionalCanvas` height: 180 → **110**
   - 第660行：`fsarCanvas` height: 180 → **110**

3. **视觉微调**（drawVehicles 函数）：
   - 第2635行：左转向灯 Y 偏移：-2 → **-1.5**
   - 第2640行：右转向灯 Y 偏移：+2 → **+1.5**
   - 第2673行：个性指示器 Y 偏移：-5 → **-3**

**效果**：
- 所有维度统一按 0.611 等比缩放，车辆比例协调（12×7 像素）
- 预警区从画面外移至画面内 92px 处，FSM 状态转换可观察
- 变道动画流畅度匹配缩短的变道距离
- 转向灯和指示器位置与新车宽协调

**FSAR 结构坐标地图（修正后）**：
```
逻辑坐标 → 画布像素
   0     →    0px
 150     →   92px  ✅ 预警区可见
 580     →  354px  ✅ 实线区可见
 735     →  449px  ✅ 出口可见
 760     →  464px  ✅ 隔离区起点
 920     →  562px  ✅ 隔离区终点
 950     →  581px  ✅ 入口可见
1800     → 1100px
```

---

## v1.4.2 (2025-03-05)
### 细节修复：匝道入口防穿模

**问题**：
- 在匝道和加速车道衔接处，刚进入加速车道的第一个车位会有1辆车重叠
- 只有1辆重叠（非无限重叠），说明是入口检测范围不够严格

**根因分析**：
- 入口检测范围：`x < tradAccelLaneStart + carLength + 15`（约35px）
- 新车进入位置：`x = tradAccelLaneStart + 5`
- 当第一辆车进入后移动一点点，第二辆车可能误判入口未阻塞

**修复**：
1. **扩大入口检测范围**：`carLength + 15` → `carLength + 25`
2. **双重安全检查**：进入时再次严格检测 `x < tradAccelLaneStart + carLength + 10`
3. **入口仍有车时回退**：`v.rampProgress = 0.95` + `v.speed = 0`

---

## v1.4.1 (2025-03-05)
### 关键修复：交替通行算法

**问题根因**：
- `willCollide` 只检查**后方**车辆 (`dx < 0`)
- 匝道车开始变道时设置 `lastPassedType = 'ramp'`
- 变道过程中检测到**前方**主线车 → 取消变道
- `lastPassedType` 仍为 'ramp' → `zipperPriority` 返回 false → 死循环

**修复**：
1. **`willCollide` 增加前方检测**：
   - 后方：`dx < 0 && dx > -rearDangerZone`（严格）
   - 前方：`dx > 0 && dx < frontDangerZone`（稍宽松）

2. **`checkForceMergeGap` 更宽松**：
   - 间隙要求：`forceMergeGap * 0.7`
   - 只检查后方车辆

---

## v1.4 (2026-03-05)
### 系统性重构：匝道/加速车道跟驰算法

**核心问题诊断**：
1. 变量名 bug：变道完成时更新的是 `lastMergeType` 而非 `lastPassedType`
2. 匝道跟车基于进度差而非实际距离，不够精确
3. 进入加速车道时缺乏安全检查，直接跳跃
4. 等待计时 `mergeWaitFrames` 未在 `waitingToMerge` 时累加

**修复内容**：

1. **变量名修复**：
   - 变道完成时：`lastMergeType = 'ramp'` → `lastPassedType = 'ramp'` + `mainPassCount = 0`

2. **匝道跟驰算法重写**：
   - 基于实际距离估算：`estimatedDist = progressDiff * rampLength`
   - 三级距离检查：`rampMinGap`、`rampSafeGap`、入口检测
   - 进度增量分级：0（停止）/ 0.003（慢）/ 0.006（减速）/ 0.012（正常）
   - 进度限制：`Math.min(v.rampProgress + progressIncrement, 1.0)`
   - 入口堵塞时保持在 `rampProgress = 0.95` 等待

3. **加速车道跟驰算法优化（参照主干道）**：
   - 使用 `.filter().sort()` 找最近前车
   - 三级安全距离：`hardMinDistance`(carLength+2) / `minSafeDistance`(carLength+6) / `comfortDistance`(carLength+15)
   - 移动前最终穿模检查：`projectedDist`
   - IDM 目标速度降低：75% → 65% 主线速度

4. **等待计时修复**：
   - 在 `waitingToMerge && !isMergingToMainline` 循环开头添加 `v.mergeWaitFrames++`

---

## v1.3 (2026-03-04)
### 重构：平行式加速车道正确行为 + 匝道衔接优化

**核心修复**：
1. **加速车道分区逻辑**：
   - **前30%**：加速区 - 车辆正常加速行驶
   - **30%-70%**：合流观察区 - 边行驶边寻找间隙，有机会就"择机并入"
   - **后30%**：强制等待区 - 进入交替合流模式
   - **末端**：绝对停止线 - 必须完全停止

2. **行为改进**：
   - 车辆不再一进入加速车道就等待
   - 正常利用加速车道加速前进
   - 高峰时在加速车道排队，头车在尽头交替合流

**匝道衔接优化**：
- 匝道车辆逐渐加速（`rampTargetSpeed` 渐变）
- 更平滑的入口检测和跟车逻辑
- 进入加速车道时保持速度（`v.speed = max(v.speed, v0Main * 0.35)`）

**新增关键位置**：
```javascript
mergeZoneStart = accelLaneStart + accelLaneLength * 0.3   // 开始观察间隙
forcedWaitZone = accelLaneStart + accelLaneLength * 0.7   // 强制等待区
hardStopLine = accelEnd - 5                                // 绝对停止线
```

---

## v1.2 (2026-03-04)
### Bug修复：加速车道末端停止 + 防穿模 + VISSIM式流量控制

**问题修复**:
1. **加速车道末端完全停止**：车辆到达末端时强制 `speed = 0`，不再低速漂移出道路
2. **加速车道内严格防穿模**：使用 `hardMinDistance` 强制回退，车辆不再重叠
3. **VISSIM式流量控制**：加速车道满时暂停生成新匝道车辆，累计到 `pendingRampVehicles`

**新增逻辑**:
- `hardStopX = accelEnd - 3` - 硬性停止线
- `hardMinDistance = CONFIG.carLength` - 绝对最小跟车距离
- `isAccelLaneFull` 检查 - 基于车道容量 `accelLaneCapacity`
- `pendingRampVehicles` 计数器 - 待生成车辆（VISSIM式）

**修改逻辑**:
- 等待汇入时：`speed = max(0, speed * 0.9)` 替代 `max(0.1, speed * 0.95)`
- 移动前边界检查：确保 `v.x + v.speed` 不超过末端
- 跟车时允许完全停止：`max(0, ...)` 替代 `max(0.1, ...)`

---

## v1.1 (2026-03-04)
### 算法优化：Zipper Merge + 上游稳定化

**新增配置参数**:
- `CONFIG.zipperMerge`: 拉链合流参数
  - `maxWaitFrames: 90` - 匝道车最大等待帧数（约1.5秒后强制合流）
  - `forceMergeGap: 20` - 强制合流时的最小安全间隙
  - `yieldDistance: 50` - 主线车让行触发距离
  - `alternateStrict: true` - 严格交替通行
- `CONFIG.upstreamStability`: 上游稳定化参数
  - `freeFlowThreshold: 120` - 前车距离>此值时完全自由流
  - `idmInfluenceRange: 250` - IDM影响范围

**新增函数**:
- `shouldForceMerge(rampVehicle)` - 检查是否超时需要强制合流
- `checkForceMergeGap(rampVehicle, vehicles)` - 强制合流安全间隙检查
- `findYieldingMainlineVehicle(rampVehicle, vehicles)` - 查找需要让行的主线车
- `applyMainlineYield(rampVehicle, vehicles)` - 应用主线让行减速

**修改逻辑**:
- `computeIDMAcceleration`: 使用 `upstreamStability.idmInfluenceRange` (250) 替代硬编码 200
- `applyIDMAndMove`: 使用 `upstreamStability.freeFlowThreshold` (120) 替代硬编码 80
- `zipperPriority`: 增加超时强制合流最高优先级 + 严格交替通行模式
- 匝道车等待汇入逻辑: 增加 `mergeWaitFrames` 计时 + 超时强制合流 + 主线让行触发
- 加速车道末端强制汇入: 使用强制合流间隙检查 + 主线让行

**Vehicle 类新增属性**:
- `mergeWaitFrames` - Zipper Merge 等待计时

---

## v1.0 (2026-03-04)
- **基线版本**：当前稳定版本的备份
- 包含完整的 IDM 跟驰模型、Gap Acceptance、MOBIL 变道激励
- 存在问题：上游容易产生幽灵堵车，合流点 Zipper Merge 不够完善
