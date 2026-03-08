# **城市快速路汇流区FSAR机制3D仿真可视化演示系统的构建蓝图与算法重构指南**

## **引言：从理论验证到工程表达的跨越瓶颈**

在现代城市交通工程领域，解决快速路汇流区拥堵问题一直是一项极具挑战性的任务。流体隔离与主动泄压（Fluid Segregation & Active Relief, 简称FSAR）机制的提出，代表了从传统的“管理紊流”向“消除紊流”的根本性物理范式转移1。高精度的VISSIM微观仿真数据已经无可辩驳地证明了该技术的有效性：在顶峰饱和工况（主线输入5700 pcu/h）这一极限场景下，FSAR机制能够触发交通流的结构性“相变”，将单车平均停车次数由基线的9.85次骤降至0.12次，降幅高达98.8%，同时促使下游主线通行流率跃迁式恢复，彻底遏制了通行能力降级（Capacity Drop）现象1。

然而，在将这一前沿技术推向实地测试并与相关政府部门、合作单位（甲方）沟通时，不可避免地遭遇了严重的认知与沟通瓶颈。甲方往往缺乏微观交通流动力学、激波理论（Shockwave Theory）以及多车道守恒方程的专业知识储备，难以通过阅读VISSIM生成的二维散点图或枯燥的数据表格来直观理解“横向交换通量（Lateral Exchange Flux）置零”或“流态相变”的物理意义1。为了打破这一信息壁垒，开发一套高保真、三维交互式、且通俗易懂的交通流仿真演示系统（Demo）成为了当务之急。

当前，许多工程团队尝试利用大语言模型（如Claude-Code）等生成式AI工具来快速构建三维交通演示Demo，但往往以失败告终。生成的动画不仅在视觉上极不准确，更在底层物理逻辑上完全背离了FSAR专利（专利号：CN202311836940.X）的核心机理1。例如，AI经常将入匝道与出匝道的空间拓扑方向画反，导致车辆发生穿模现象（穿透物理隔离区屏障），车道链接关系混乱，且跟驰算法（Car-following Model）极为粗糙。更为致命的是，现有AI生成的车辆完全缺乏战术决策能力（只会机械直行），彻底忽略了FSAR系统中最关键的动态反馈逻辑：车辆在到达泄压出匝道前，根据前置路牌与电子变道线提示尝试变道合并，仅当“变道失败”时，该车辆才会被迫驶入出匝道进行泄压1。这一关键的“基于失败的动态泄压”逻辑，正是FSAR能够实现“低速差车流的低摩擦合并效率远高于高速差车流”这一物理特性的核心所在1。

本报告旨在提供一份详尽的、达到专家级别的技术蓝图，全面解构现有AI在生成交通仿真Demo时的失效机理，并系统性地重构面向WebGL（如Three.js框架）底层数学逻辑与战术状态机算法。同时，本报告将梳理出一套专门针对AI大模型（如Claude-Code）的高级提示词工程（Prompt Engineering）体系，以及一套面向甲方的可视化故事板（Storyboard）策略，以协助开发团队精准实现具有高度科学性与说服力的FSAR机制3D演示系统2。

## **第一部分：现有AI生成交通仿真Demo的失效机理深度剖析**

在利用生成式人工智能（如Claude-Code）编写三维交通仿真代码时，开发者通常会遇到一系列违背物理常识和交通工程原理的错误。这些错误并非偶然，而是由大语言模型的内在运行机制、缺乏空间拓扑感知能力以及对连续介质力学模型的无知所共同导致的。为了在后续开发中彻底纠正这些问题，必须首先对AI的失效机理进行深度的技术剖析。

### **1\. 空间拓扑与路网链接的系统性幻觉**

在交通仿真中，路网拓扑（Topology）是约束车辆运动轨迹的绝对基准。现有AI工具在处理复杂的交通互通枢纽时，往往倾向于调用其训练数据中最常见的“Y型合流”模板（即先入后出的传统结构），而FSAR机制的核心精髓恰恰是“拓扑逆序（先出后入）”1。

AI在生成代码时，通常将道路简单定义为平行的坐标数组，缺乏有向图（Directed Graph）的数据结构支撑。这导致了三个致命的显示错误：首先，入匝道与出匝道的方向和顺序被颠倒，彻底破坏了隔离区（Vacuum Zone）存在的前提1。其次，车道链接关系不准确。在FSAR专利中，主干道最外侧车道在出连接口和入连接口之间被定义为“不可通行的隔离车道”，这就要求车道样条曲线（Spline）在此处必须发生逻辑断裂或被施加绝对的运动学约束1。AI往往无法理解这种局部的拓扑切断，依然允许车辆按原样条曲线插值行驶，导致视觉上的逻辑崩溃。

### **2\. 物理碰撞体积与穿模现象的根源**

在用户反馈中，极其突出的一个问题是“车辆会穿透隔离区屏障”。在真实的交通微观仿真（如VISSIM或AnyLogic）中，隔离设施被定义为不可逾越的刚体障碍物或绝对的跟驰目标4。然而，当使用AI生成Three.js等前端WebGL代码时，AI为了追求代码的简洁性和运行帧率，往往省略了连续碰撞检测（Continuous Collision Detection, CCD）算法和层次包围盒（Bounding Volume Hierarchy, BVH）的构建5。

由于AI倾向于使用简单的线性插值（Lerp）或低阶欧拉积分来更新车辆位置，隔离区的硬约束（Hard Constraint）在代码中仅仅表现为视觉上的三维网格（Mesh），而没有被写入物理引擎的碰撞层（Collision Layer）。当车辆的更新步长跨越了屏障的厚度时，穿模现象必然发生。此外，由于AI未实现正确的局部避障算法（如RVO算法或NavMesh导航网格），车辆无法感知物理屏障的斥力场，进一步导致了违背常理的穿透现象。

### **3\. 微观运动学缺陷：粗糙的车辆密度与跟驰算法**

交通流的本质特征是由车辆间的非线性相互作用所引发的宏观波动（如启停波、激波回溯）1。演示Demo的核心任务之一，就是向甲方展示传统结构下的“高熵紊流”是如何被FSAR结构转化为“低熵层流”的1。然而，AI生成的演示系统通常采用极为简陋的匀速运动模型或简单的基于距离的刹车逻辑，完全丧失了交通动力学的拟真度。

在这种粗糙的算法下，车辆之间的车头时距（Time Headway）和安全距离（Safety Distance）被硬编码为静态常量。当车流密度增大时，车辆要么发生重叠，要么瞬间停止，无法展现出真实交通流中驾驶员的反应延迟、加速极限以及在拥堵临界点发生的“通行能力降级”现象1。没有精确的跟驰模型（如智能驾驶员模型 Intelligent Driver Model, IDM），演示系统就无法重现传统路口因频繁加减速导致的严重排队和延误，进而使得FSAR机制的改善效果失去了对比的基础和说服力1。

### **4\. 战术决策算法的缺失：机械直行与状态机的盲区**

用户提到的最关键缺陷在于：“车辆只会直行，大部分AI都没识别到我们专利中关于车辆变道合并失败才泄压的关键内容”1。这触及了微观交通仿真中最复杂的模块——车辆战术换道决策。

在AI自动生成的代码中，车辆通常只具备单一的目的地属性（Origin-Destination, OD），其路径在生成时已被锁定。如果一辆车被设定为直行，它将无视任何障碍强行沿直行轨迹行驶。然而，FSAR机制的精妙之处在于一种高度动态的条件反馈循环：车辆的路径并不是绝对固定的，而是基于实时路况和前置路牌（电子变道线）进行动态博弈的结果1。

车辆在进入分流区时，首先具有维持主线行驶的倾向（主动变道意图）。只有当相邻车道（内侧车道）密度过高，导致该车辆在可接受的安全间隙（Gap Acceptance）内无法完成变道，且此时车辆已行驶至实线锁定区（变道失败）时，其内在状态机（Finite State Machine, FSM）才会发生强制翻转，将目的地修改为出匝道（被迫泄压）1。这种由“局部变道失败”触发的“宏观主动泄压”，是切断拥堵传播链条的核心。AI缺乏将专利文本中的这一高级逻辑转化为复杂状态机代码的能力，因此导致了仿真车辆表现得如同没有智能的盲目粒子。

## **第二部分：FSAR核心物理机制的通俗化表达框架**

为了让甲方（相关政府部门和合作单位）能够在短时间内快速理解并认同FSAR技术，演示Demo的设计不能局限于学术界的数学公式推导，而必须构建一套通俗易懂且极具视觉冲击力的物理概念表达框架。本节将详细梳理在向甲方演示时必须传达的核心理念，并将这些理念转化为可被三维可视化的视觉隐喻8。

### **1\. 痛点重构：从“拥堵排队”到“通行能力黑洞”**

在与甲方沟通时，必须首先纠正一个普遍的常识性误区：交通拥堵不仅仅意味着车辆行驶缓慢，更严重的是它会直接“吞噬”道路的吞吐量。在演示Demo的开场，必须通过直观的数据对比展示传统并行混合流（Y型冲突）的脆弱性1。

应当向甲方阐述，当高速的主线车流与低速的匝道车流在同一物理空间内强行混合时，会产生剧烈的“横向剪切力（Lateral Shear）”和“交织紊流（Weaving Turbulence）”1。这种高强度的摩擦不仅导致车辆频繁启停，还会触发激波向上游回溯。在视觉演示上，这种现象应表现为车辆尾部的红色刹车灯连成一片，形成向后传播的红色波浪。此时配合UI数据面板显示：原本设计通行能力为5400 pcu/h的道路，一旦拥堵爆发，其实际通过量将跌落至4000 pcu/h以下1。这向甲方传达了一个强烈的信息：传统的汇流区不仅是拥堵点，更是造成整体路网效率塌缩的“通行能力黑洞”。

### **2\. 机制解构：拓扑逆序与“压力安全阀”**

在解释FSAR机制时，需要引入“拓扑逆序（Topology Reversal）”和“压力安全阀”的通俗比喻。传统的互通立交设计遵循“先汇入、再驶离”或“边汇入、边驶离”的模式，这好比在一个已经沸腾的锅里继续加水，必然导致溢出。

演示Demo应通过清晰的动画展示FSAR的重构逻辑：在最外侧车道上，首先设置一个“出连接口”（泄压阀），紧接着是一段由物理屏障或电子围栏封闭的“隔离区（真空区）”，最后才是“入连接口”1。向甲方解释，这种设计的目的是在空间上创造一个缓冲序列。前置的出连接口就像高压锅的排气阀，在主线车流达到崩溃临界点之前，预先释放掉一部分压力，从而保护主线核心车流的稳定性1。

### **3\. 核心亮点：“变道失败即泄压”的动态博弈**

这是用户特别强调且AI经常遗漏的灵魂逻辑。在向甲方演示时，必须着重拉近镜头，给出一辆特定车辆（如标记为蓝色的目标车）的特写，生动展现这一微观动态博弈过程。

在演示中，这辆蓝色汽车原本希望在主线继续行驶。根据前置路牌和上方动态电子变道线的提示（在未拥堵时为虚线，在拥堵临界时变为实线），它尝试向内侧车道并线1。此时，内侧车道车流密集，没有提供安全的插车间隙。蓝色汽车在到达不可变道区（实线区）时，由于被物理规则限制，宣告“变道失败”。此时，系统强制其状态翻转，顺势驶入出匝道完成“泄压”1。

必须向甲方强调，这种“被迫泄压”并不是系统设计上的缺陷，而是极其精妙的主动防御机制。它避免了这辆车在主线上强行刹车、硬挤而引发的后方连环追尾和拥堵激波。通过牺牲这极小部分车辆的原本路径（将其导入辅道或下游重新汇入），换取了整条主干道的不降速通行。

### **4\. 物理本质：低速差与低摩擦的流态相变**

为了体现专业性并阐明“低摩擦特性”的优势，演示Demo必须清晰对比“高速差摩擦”与“低速差合并”的截然不同1。

在传统模式（基线对照组）下，演示从匝道以30 km/h驶入的车辆，强行切入时速80 km/h的主线。这种巨大的速度差（50 km/h的侧向剪切）就像齿轮强行咬合，产生剧烈的“摩擦”，导致主线车群集体急刹车，形成严重的紊流产额（Turbulence Yield）1。

而在FSAR模式下，视觉画面将展现令人震撼的“真空填充”过程。因为上游已经完成了泄压，且由于隔离区的存在，入连接口处的最外侧车道被完全清空，形成了一个没有主线车辆干扰的“空槽”1。此时演示匝道车辆驶入这一空槽，由于前方没有任何阻挡，它可以肆无忌惮地直线加速。当该车辆加速至80 km/h，与内侧主线车流的速度完全同步时，它再平滑地并入内侧车道。

在这个过程中，速度差接近于零（低速差），换道过程几乎没有任何“摩擦干扰（Friction Interference）”1。这一视觉对比深刻揭示了FSAR的物理优势：通过结构上的隔离预留出加速空间，将破坏性的高速差混合，转化为了极高效率的低速差合并。这不仅是车速的提升，更是交通流态从“紊流态”向“准层流态（Quasi-laminar Flow）”的相变（Phase Transition）1。

### **5\. 宏观算账：4.8%的净牺牲换取帕累托最优**

甲方的最终顾虑往往落在“强制车辆泄压是否会引发严重抗议”上。此时，演示Demo的数据面板必须发挥作用，引入“净牺牲率（Net Sacrifice Ratio）”的概念1。

通过实时图表向甲方展示：在包含20%自然驶离需求的现实高峰场景下，泄压通道中的绝大部分车辆原本就是要下高速的。真正因为变道失败而被系统强制泄压的“无辜”车辆（净牺牲流量），仅仅占总车流的约4.8%1。而就是这微不足道的4.8%的让步，换取了下游主线吞吐量近28.8%的暴涨（从4248提升至5472 pcu/h），相当于每牺牲1辆车，就多放行了近5辆车1。通过这种强烈的数字对比，甲方将彻底明白：FSAR不是粗暴的限流，而是一种以极小的边界代价换取宏观流体全局稳定性的帕累托改进（Pareto Improvement）。

表 1：向甲方解释FSAR核心概念的话术与视觉对应表

| 核心物理概念 | 甲方易懂的通俗比喻 | 3D演示中的视觉隐喻设计 | 核心KPI数据联动 |
| :---- | :---- | :---- | :---- |
| 通行能力降级 (Capacity Drop) | “拥堵黑洞”：堵车不仅仅是慢，而是路面的放行能力被彻底破坏。 | 传统模式下，车流颜色由绿变红，车辆尾部产生剧烈的红色交叉轨迹，并回溯成拥堵带。 | 下游主线流率从设计值骤降至低谷。 |
| 拓扑逆序与隔离区 | “压力安全阀”与“无干扰缓冲区”：先排气再加水，互不干扰。 | 隔离区由动态升降的电子屏障构成，物理切断最外侧车道，车辆在屏障两侧独立行驶。 | 物理冲突点数量归零。 |
| 变道失败即泄压 | “聪明的不死磕”：与其强行挤占主线导致全线瘫痪，不如顺势辅道绕行。 | 车辆靠近实线，左转向灯闪烁但无间隙，接触实线后转向灯熄灭，顺滑驶入泄压匝道。 | 净牺牲率仅约4.8%，且牺牲车辆最终通过辅道回注。 |
| 低速差低摩擦合并 | “同步齿轮咬合”：在专属空跑道上把速度提上来，再以零速度差并入。 | 匝道车辆在被清空的最外侧车道上拖出加速尾迹（蓝色），直到速度计与主线同步后再并线，无激波产生。 | 顶峰工况下单车平均停车次数由9.85次降为0.12次（近乎零停车）。 |

## **第三部分：3D可视化系统的底层数学与路网拓扑重构**

要彻底解决AI生成演示中出现的穿模、方向错误和逻辑混乱，开发团队不能依赖大模型的自动漫游，而必须手动在WebGL框架（如Three.js）中构建严密的数学拓扑图和运动学约束。

### **1\. 基于样条曲线（Splines）的有向图构建**

在交通仿真中，车辆绝对不能像自由粒子一样在三维空间中随意移动（这正是穿模的根源）。每一条车道必须被严格定义为一条三维样条曲线（例如Three.js中的THREE.CatmullRomCurve3）3。整个路网必须被抽象为一个有向图（Directed Graph）。

对于FSAR演示系统，必须建立以下拓扑节点和边：

* **主干道内侧车道集（Lane 2, Lane 3...）：** 贯穿整个仿真区域的连续平滑曲线，作为高速层流的承载体。  
* **最外侧动态车道（Lane 1）：** 这是拓扑构建的核心。这条曲线不能是单一的，必须根据FSAR专利分割为四个独立的线段逻辑1：  
  * **分流准备区：** 从场景起点至电子变道线终点（出连接口前）。  
  * **泄压分支（Ramp Exit）：** 从出连接口剥离，向外侧延伸的曲线。  
  * **隔离真空区（Vacuum Zone）：** 从出连接口至入连接口之间的线段。在底层代码中，这段曲线必须附加绝对约束属性：isPassable \= false。任何试图将车辆坐标映射到此曲线的算法都将被引擎抛出异常，从物理根源上杜绝穿模1。  
  * **汇入加速区：** 从入连接口起始，承接入匝道（Ramp Entry）的输入，并在下游重新提供与Lane 2的合流链接。

### **2\. 空间坐标系与车辆对齐**

AI经常无法正确处理车辆的车头朝向。在沿样条曲线运动时，必须实时计算曲线在车辆当前位置的一阶导数（切线向量，Tangent），并利用Frenet标架（Frenet Frame）来动态更新车辆Mesh的旋转四元数（Quaternion）。这样，无论是入匝道的弯曲汇入，还是泄压匝道的急转弯，车辆都能严格顺应道路几何线形，呈现出极高的专业真实度6。

### **3\. 高性能渲染架构：实例化网格（InstancedMesh）**

为了展现出“高峰”、“顶峰”等每小时数千辆车（如5700 pcu/h）的震撼车流密度，如果为每辆车创建一个独立的3D对象，浏览器将因Draw Call过多而崩溃。开发中必须强制要求使用THREE.InstancedMesh10。通过在显存中维护一个变换矩阵数组（Matrix4 Array）和颜色数组，GPU可以在一次绘制调用中渲染数万辆汽车。车辆在跟驰、加速、急刹车时的动态颜色变化（从层流的绿色渐变到紊流的红色），均可以通过更新InstancedMesh的Color属性来实现极低开销的渲染11。

## **第四部分：车辆微观运动学与战术决策状态机（FSM）设计**

解决了道路这个“静态容器”的问题后，接下来必须赋予车辆真实的交通流物理灵魂。这是取代AI机械插值（Lerp）的决定性步骤。在渲染主循环（Render Loop）或专门的Web Worker中，必须嵌入以下两套严密的数学与逻辑算法。

### **1\. 纵向跟驰：智能驾驶员模型（IDM）**

为了在演示中真实再现车辆因为拥堵而产生的“启停波（Stop-and-go waves）”，以及FSAR结构消除拥堵的对比效果，所有车辆的纵向加速度 ![][image1] 必须由连续的微分方程驱动，而非预设的动画。智能驾驶员模型（IDM）是交通工程界公认的标准13：

![][image2]  
其中，期望安全距离 ![][image3] 定义为：

![][image4]  
通过在底层代码中实现这一方程，当前方车辆因汇入摩擦减速时，后方车辆将根据自身的反应时间 ![][image5] 和舒适减速度 ![][image6] 动态刹车。在基线组演示中，观众将真实看到激波在车流中向后传播的物理奇观；而在FSAR组演示中，由于真空区的缓冲，该方程的阻力项将被大幅削弱，车流将自然呈现出顺畅平滑的层流状态1。

### **2\. 横向决策与FSAR专属状态机（FSM）**

现有基于MOBIL（Minimizing Overall Braking Induced by Lane Change）的换道模型无法处理“变道失败即泄压”的高级逻辑。因此，必须在MOBIL模型之上，为处于最外侧车道（Lane 1）的车辆硬编码一套专属的有限状态机（Finite State Machine, FSM）。

在代码层面，每辆在最外侧车道生成的车辆都被赋予一个内部标签 Destination: Mainline（设定占比80%）或 Destination: Exit（自然驶离，占比20%）1。车辆在行驶过程中将严格遵循以下状态流转：

* **状态 1：接近预警区（STATE\_APPROACH）**  
  车辆进入系统，读取前置路牌和电子变道线状态。系统计算距离出连接口的剩余距离 ![][image7]。  
* **状态 2：变道博弈区（STATE\_SORTING）**  
  当 ![][image7] 小于预警阈值时，如果车辆标签为 Mainline，车辆激活向内侧车道（Lane 2）的换道意图。此时，调用改进的MOBIL模型评估相邻车道的安全间隙（Gap Acceptance）。如果满足安全条件，执行换道动画，状态切换为 STATE\_CRUISE（主线巡航）。  
* **状态 3：临界判定与强制翻转（STATE\_DECISION）** 这是FSAR专利的灵魂代码区1。随着车辆继续前行，如果路面电子变道线变为实线（不可变道区），或者车辆距离出连接口已不足最后安全距离（即始终未找到插车间隙），代码将触发“变道失败”事件。 此时，系统将强制执行状态覆盖（Override）：将该车辆的标签由 Mainline 强行改写为 Exit。车辆接受自己被“献祭”的命运。  
* **状态 4：主动泄压（STATE\_RELIEF）** 所有标签为 Exit 的车辆（无论是自然驶离还是被迫泄压），其样条曲线跟踪目标被锁定为出连接口的 Ramp\_Exit 曲线。它们驶出主干道，确保最外侧车道在此节点后被彻底清空，形成隔离区的物理真空1。  
* **状态 5：零摩擦汇入（STATE\_ZERO\_FRICTION\_MERGE）** 从入连接口（Ramp Entry）生成的车辆进入已经真空化的最外侧车道。由于前方没有任何主线车辆阻挡，IDM模型驱动车辆全速加速。当速度差 ![][image8] 接近于0时，车辆无缝并入内侧主干道，完美展示“低速差低摩擦特性”1。

表 2：车辆横向状态机（FSM）触发条件与行为逻辑矩阵

| 初始意图 | 外部环境条件 | 触发事件 (Event) | 状态翻转结果 | 3D视觉表现反馈 |
| :---- | :---- | :---- | :---- | :---- |
| 继续主线行驶 | 侧方有足够安全间隙 | 寻找间隙成功 | STATE\_CRUISE | 闪烁左转向灯，平滑并入内侧车道。 |
| 继续主线行驶 | 侧方拥堵，到达实线锁定区 | 变道失败 | 强制转为 STATE\_RELIEF | 转向灯熄灭，放弃并线，沿最外侧车道驶向出连接口，UI弹出“保护性泄压”提示。 |
| 驶离主线 (自然) | 无需判断侧方间隙 | 直接进入泄压序列 | 保持 STATE\_RELIEF | 提前减速，顺滑驶向出连接口。 |
| 匝道汇入 | 最外侧车道为“真空”空槽 | 驶出隔离区末端 | STATE\_ZERO\_FRICTION | 在空车道直接加速，速度计颜色由红转绿，与内侧车队零速差并排后汇入。 |

## **第五部分：向AI大模型提供准确的系统级提示词工程（Prompt Engineering）**

用户在使用Claude-Code等自动编码代理时，由于提示词（Prompt）过于宽泛（如“写一个交通仿真”），导致AI只能生成通用且粗糙的演示。为了利用大模型高效产出上述复杂的3D系统，必须摒弃人类日常语言，转而使用系统级、具有高度工程约束力的结构化提示词3。

以下是为您总结的、可以直接喂给AI模型的精准提示词框架，建议分步输入以指导AI构建：

### **1\. 场景与拓扑结构构建提示词**

**系统角色与背景：** 你是一个资深的Three.js图形程序员兼交通工程算法专家。我们需要构建一个高保真的城市快速路微观交通流WebGL演示系统。

**拓扑结构绝对约束（必选）：** 构建一个具有3条主线车道的三维路网。关键约束在于最外侧车道（Lane 1）的重构。你必须严格实现“拓扑逆序”：在Z轴坐标上，先设置出匝道（泄压口），再在下游设置入匝道。在这两个匝道开口之间的Lane 1必须被定义为“隔离区（Vacuum Zone）”。在代码底层，隔离区的样条曲线必须设定为不可通行（isPassable \= false），任何车辆不得生成或越界进入此区域，请使用碰撞层级严格限制。

### **2\. 微观运动学物理引擎提示词**

**运动学算法约束：** 绝对禁止使用简单的Lerp函数更新车辆位置。请实现智能驾驶员模型（Intelligent Driver Model, IDM）作为车辆纵向加速度的唯一计算公式。设置最大加速度为1.5 m/s²，舒适减速度为2.0 m/s²。在进行车辆实例化网格（InstancedMesh）更新时，每帧必须根据前方最近车辆的距离和相对速度实时积分计算当前加速度和位置，以此自然生成拥堵激波和启停波现象。

### **3\. 核心“变道失败即泄压”战术逻辑提示词**

**状态机（FSM）核心约束：** 请在车辆类中重写横向变道逻辑。设定所有在Lane 1生成的车辆中有80%希望并入内侧主线。实施以下强制状态机：当这些车辆行驶至出匝道前的预警区时，尝试寻找内侧车道的安全插车间隙。如果在到达出匝道分流点之前（或者触碰到动态实线时），仍未找到安全间隙（即变道失败），代码必须立刻捕获此事件，强制将该车辆的目的地覆写为出匝道。该车辆将被迫驶离主线以完成“主动泄压”。这是展示低摩擦特性的关键，绝不能让变道失败的车辆在主线上停车等待！

### **4\. 视觉隐喻与Shader渲染提示词**

**视觉呈现要求：** 我们需要展示交通流从“高熵紊流”到“准层流”的物理相变。请利用顶点着色器（Vertex Shader）或InstancedMesh的颜色属性，将车辆的实时速度映射为颜色。高速（\>60km/h）呈现绿色/蓝色，低速和急刹车呈现黄色到深红色。在传统拥堵演示中，展现剧烈的红色拥堵回溯波；在FSAR泄压后的路段，确保车辆汇入表现为平滑的绿色水流状。出匝道与入匝道之间的隔离区，请生成升起的物理栅栏或发光的电子围栏阵列模型。

通过这种“结构定义 \+ 数学约束 \+ 状态机覆写”的复合提示词工程，可以有效钳制生成式AI的“幻觉”，逼迫其输出符合交通流体力学逻辑和FSAR专利规范的可用底层代码1。

## **第六部分：面向甲方的可视化故事板与数据联动设计**

一套优秀的演示Demo不仅仅是冰冷的代码运行，更是一场说服力极强的“科学叙事”。在完成Three.js底层系统的构建后，需要设计专门的用户界面（UI）层，将VISSIM仿真得到的权威数据1与3D动画进行深度联动，通过故事板（Storyboard）引导甲方视角8。

### **1\. 双屏对照与“相变”的视觉冲击**

演示系统的核心UI布局应采用“双视角分屏”或“一键切换”模式。

* **基线模式（当前结构）：** 展示一幅混沌的图景。入匝道处大量低速车辆强行涌入主线，产生巨大的红色涟漪（可视化速度差与紊流产额）。主干道大面积泛红，排队长度不断向上游蔓延。  
* **FSAR模式（未来愿景）：** 伴随着清脆的UI提示音，动态物理隔离区升起，路面电子变道线激活。此时，画面呈现出高度的秩序感：出匝道分流走部分车辆（主动泄压），入匝道处车辆在无干扰的空槽内顺滑加速至绿色，然后如拉链般完美汇入主线。

### **2\. 实时数据面板（Data Dashboard）的锚定效应**

为了让甲方从“感性认知”上升到“理性确信”，在3D渲染之上，必须悬浮一个基于真实仿真数据驱动的数据面板（如使用D3.js或ECharts构建）8。这些数据仪表的跳动必须与3D动画中的车流表现保持绝对的一致性：

* **相变标志器（停车次数归零）：** 在顶峰工况测试时，面板上的“单车平均停车次数”必须从基线模式下的刺眼的“9.85次/车”快速归零，稳定在“0.12次/车”1。这个指标是证明紊流被彻底消除、流态发生相变的最直接铁证。  
* **吞吐量恢复与速度跃迁：** 实时流率（Flow Rate）仪表盘展示，在FSAR机制介入后，主线有效放行流率从4248 pcu/h大幅反弹至5472 pcu/h，同时平均车速从拥堵的16.8 km/h跃升至45.2 km/h（提升约170%）1。  
* **净牺牲率透明化拆解（打破疑虑）：** 当系统执行车辆“变道失败”强制泄压的动作时，面板上的一个动态饼图开始工作。它清晰地将流出出匝道的总车流（例如25.2%）剥离开来，明确标示其中20.5%是“自然驶离需求”，而真正因为保护主线被迫付出的“净牺牲率”仅为4.8%1。这种高度透明的数据拆解，将彻底打消甲方对于“强制泄压会导致大规模绕路”的顾虑。  
* **入匝道满足率的反转：** 为回应“保护主路是否牺牲了辅路”的质疑，面板应展示入匝道满足率指标。基线拥堵时，入匝道车辆被堵死，满足率仅为约28.8%；而在FSAR“零摩擦汇入”机制下，入匝道车辆畅通无阻，满足率跃升至99.2%1。通过数据向甲方证明：这是一种全局的双赢。

表 3：演示系统故事板（Storyboard）与解说节点设计15

| 场景阶段 | 3D视角控制 | 动画表现与系统反馈 | 面向甲方的解说词 / 核心理念传达 |
| :---- | :---- | :---- | :---- |
| **第一幕：困局** Y型冲突的宿命 | 宏观俯视，聚焦传统汇流区。 | 输入流量增加至极值。强行并线引发激波，大量车辆制动，车群变为红色，排队蔓延。 | “在极限流量下，传统的并行混合不可避免地引发剧烈的高速差摩擦。这就是导致通行能力塌缩的‘紊流黑洞’。” |
| **第二幕：重构** 拓扑逆序与阀门 | 镜头推进，切换为FSAR结构。 | 电子机器人展开物理隔离屏障。出连接口与入连接口被彻底分离。电子变道线亮起。 | “我们不是在修补混乱，而是从物理上重构秩序。通过先出后入和真空隔离，我们从根本上切断了摩擦产生的物理根源。” |
| **第三幕：破局** 变道失败即泄压 | 跟随特定车辆（特写镜头）。 | 车辆尝试并入主线失败，碰到实线边界后，系统强制其顺畅驶入出匝道。饼图显示仅牺牲4.8%。 | “这是系统的‘安全阀’。当系统面临崩溃风险时，主动引导极少量车辆泄压。以仅约4.8%的微小代价，换取全局免于瘫痪。” |
| **第四幕：相变** 低摩擦层流 | 水平追车视角（跟随入匝道车辆）。 | 在真空的外侧车道，匝道车辆在无任何主线干扰的“空槽”中全速加速，随后以零速差平滑汇入主干道。 | “这就是低速差的魅力。消除了所有摩擦阻力，车辆无需争抢。系统完成了从‘高熵紊流’到‘零停车层流’的相变，吞吐量强势恢复。” |

## **结语**

贵公司所研发的FSAR（流体隔离与主动泄压）技术，在交通工程理论与仿真数据上已经具备了坚实的科学基础。当前在沟通中遭遇的阻碍，本质上是高维流体动力学理论向低维视觉感知转换过程中的信息失真。通用AI工具之所以在生成演示时频频出错，是因为它们缺乏对物理常识、路网拓扑约束以及复杂战术状态机（如“变道失败即泄压”）的深层理解。

通过本报告所提供的高级重构指南，开发团队应摒弃对AI自动生成黑盒的过度依赖，转而以严格的数学拓扑和运动学方程（如IDM与自定义FSM）构建WebGL仿真的底层逻辑。结合本报告提供的结构化提示词工程辅助代码编写，以及精心设计的面向甲方的数据联动故事板，这套3D演示系统将不仅仅是一个视觉动画，而将成为一台严谨的“数字风洞”。它将以最具说服力的直观视觉和实时数据，彻底阐明“低摩擦特性”与“低速差合并”的绝对优势，从而全面打通从理论技术向实地工程转化、以及获取相关部门和合作单位战略认同的关键路径。

#### **引用的著作**

1. 从管理紊流到消除\_工程版\_优化.docx  
2. movsim/traffic-simulation-de: Source code for javascript simulation of website \- GitHub, 访问时间为 三月 1, 2026， [https://github.com/movsim/traffic-simulation-de](https://github.com/movsim/traffic-simulation-de)  
3. Promptable Closed-loop Traffic Simulation, 访问时间为 三月 1, 2026， [https://ariostgx.github.io/ProSim/](https://ariostgx.github.io/ProSim/)  
4. Road Traffic Simulation Software \- AnyLogic, 访问时间为 三月 1, 2026， [https://www.anylogic.com/road-traffic/](https://www.anylogic.com/road-traffic/)  
5. Create A 3D Driving Test Quiz Using Three.js, Yuka, and GSAP \- YouTube, 访问时间为 三月 1, 2026， [https://www.youtube.com/watch?v=WIZ5kbeVMkM](https://www.youtube.com/watch?v=WIZ5kbeVMkM)  
6. Self-Driving Car with JavaScript Course – Neural Networks and Machine Learning, 访问时间为 三月 1, 2026， [https://www.youtube.com/watch?v=Rs\_rAxEsAvI](https://www.youtube.com/watch?v=Rs_rAxEsAvI)  
7. Getting Started With Traffic Simulation in JavaScript \- Stack Overflow, 访问时间为 三月 1, 2026， [https://stackoverflow.com/questions/6006875/getting-started-with-traffic-simulation-in-javascript](https://stackoverflow.com/questions/6006875/getting-started-with-traffic-simulation-in-javascript)  
8. 8 Storyboard Examples For Your Next Big Idea \- Venngage, 访问时间为 三月 1, 2026， [https://venngage.com/blog/storyboard-examples/](https://venngage.com/blog/storyboard-examples/)  
9. How to use storyboarding techniques to solve complex business problems, 访问时间为 三月 1, 2026， [https://www-2.rotman.utoronto.ca/insightshub/creativity-innovation-business-design/Design\_thinking\_storyboards](https://www-2.rotman.utoronto.ca/insightshub/creativity-innovation-business-design/Design_thinking_storyboards)  
10. Examples \- Three.js, 访问时间为 三月 1, 2026， [https://threejs.org/examples/](https://threejs.org/examples/)  
11. Visualizing Laminar and Turbulent Regimes in a Transitional Simulation \- Innovation Space, 访问时间为 三月 1, 2026， [https://innovationspace.ansys.com/courses/courses/topics-in-turbulence-modeling-using-ansys-cfx/lessons/visualizing-laminar-and-turbulent-regimes-in-a-transitional-simulation/](https://innovationspace.ansys.com/courses/courses/topics-in-turbulence-modeling-using-ansys-cfx/lessons/visualizing-laminar-and-turbulent-regimes-in-a-transitional-simulation/)  
12. Animation of Laminar Flow and Turbulent Flow \[Fluid Mechanics\] \- YouTube, 访问时间为 三月 1, 2026， [https://www.youtube.com/watch?v=neD9XPPJuto](https://www.youtube.com/watch?v=neD9XPPJuto)  
13. Web Based Microscopic Traffic Flow Simulator \- Qucosa \- Technische Universität Dresden, 访问时间为 三月 1, 2026， [https://tud.qucosa.de/en/landing-page/https%3A%2F%2Ftud.qucosa.de%2Fapi%2Fqucosa%253A95466%2Fmets/](https://tud.qucosa.de/en/landing-page/https%3A%2F%2Ftud.qucosa.de%2Fapi%2Fqucosa%253A95466%2Fmets/)  
14. Traffic Scene Generation from Natural Language Description for Autonomous Vehicles with Large Language Model \- arXiv, 访问时间为 三月 1, 2026， [https://arxiv.org/html/2409.09575v1](https://arxiv.org/html/2409.09575v1)  
15. 15 Storyboard Examples to Visualize Customer Journeys & Campaigns | Miro, 访问时间为 三月 1, 2026， [https://miro.com/storyboard/storyboard-examples/](https://miro.com/storyboard/storyboard-examples/)  
16. Agile Scenarios and Storyboards \- Roman Pichler, 访问时间为 三月 1, 2026， [https://www.romanpichler.com/blog/agile-scenarios-and-storyboards/](https://www.romanpichler.com/blog/agile-scenarios-and-storyboards/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAZCAYAAAAIcL+IAAAAcklEQVR4XmNgGAUDCi4B8Qsg/gbETkB8F1UaAv4DcR0S/y9UDAV8xCIIMhldDCzwHIvYF2SBEKhgOrIgVKwSWWAHVBAZyEHFWJEFp0AFkcESJLGlMEFuJEEQcIPyYWIohjhDBUA4Gyr2D8oXgikaBTgBAJv8IeeKuEwpAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAZCAYAAACM5XJ+AAAEw0lEQVR4Xu3deahuUxjH8cc8FBIy/KEbUaYyC2WeMuQf0hUyFhcJKRTnH6XITBKuFIoo+UeGRFEyRCRSFEVEZjJkWL/WWp3nfc7a++zt3Pu6x/1+6ums9ay1h/c9f+yn/e71vmYAAAAAAAAAAAAAgA6bpVgrJtHrkBRHxeRKdnyK7WMy2CTF+jEJAAAWv61T/B2TA22YYseY7DFm7qpoc8vv1TpxYEoOT3FeTAZ9/8vF/v4DALBa00V+3Zgc4EjrLxCiMXNXRSfaf/8aHomJ4PcUe8VkMfbcb7O8jd9uxrUBAMAU3ZjimZgcgIJt+uYr2I5L8W1MFmPPvTW/lQMAAFPyby7EFGzTN1/BJl3n2JXv0prfygEAgIHesnwxPTvFxaX98MSMfstjovgrxVcpDkpxl+X97lTGfMF2dGn/mOLMFFeV/itlXNT/LcXlNnuO24Xx91Mcm+Kc0l/Pja8Ia1je72UpDivtjydmdLsjxduuf73l7RVLU/xU2g+lWJbiytK/r26QfJPiQcvv57VlvNo7xYuuf2uK011fvgj9ljNSrBmTNnms80tfr6Ge591l7MkSytX2NY0cAAAYYW2bvBjLlo3cfC4K/Qts7j7uTPFnabcKtkNLv/Lbq+0f2FdR8YPrqzD03rHJgi+6pSe6PGqTKylrATefXS3P28LlasHmqf+R6+9RcrKza1cnWX4fK40fmGKr0o703j8Vkw2Px4TN/V/411JzfX1p5QAAwAKMvbgOmX+wzc5rFWzRe67dGm/lqhnrH9dD8V0xho6hFa999rE8bwOX6yrYLmzkuqhgvMH197Q8X3Gqy1e/pHg9Jhtax/S51rj2rbttVWtOKwcAAAba3/LHl/ViX2MMzY/f4zVT8jFkSMF2j81+z1tr3OfuLf0YK9rPNvcYG0/MaNP5ver6XQXbWY1cdVrp+7jZjUs9vxZ9pDqEVovuF3J+n/EcarwQ5kStHAAAGGAbyxfSJSE/9uKqOz3Pu/5Nlvehu0DVESUnQwq2l1y7Ne5zer7Nu87a21S6K9YVXd5McUzI6RhDCra46GBswXaCa1f6OhVfsF1tec6vlj++jYYsOhA9B/h9yPljx/Noac1p5QAAwAAqtOKFVB9vxdwQ2qY+sK7npeqD6KK8xut+WwXb7aUvm5Zc1TqfmlOBcYofsMljtWzbE13i/j4suWkUbK9ZXlThaawWbCqM/3BjX6bYyPVlaMEmuuO6g+vH/4UWXVT1S4F9cR5fm7RyAABgoFrc3F/+Lil/x1qe4rHS3tfyPr5L8YHlAqBe2KVVsGkF5BuWFxCov6yMS+t8YhHxSYqnS1sP5Le2WYhLLO/zgRSfWf6JKfWnUbDVAvY5y3f61NYzcbVgU7EWV3fG/Y8p2LRa9HPX9/vavfRV2H9a2l3n7SmneDkOAACAYfTTRXpGaqH8hVp3XE62yTs1Lf4jUd0tU38sfZSpImNl/07nASnOtbySdoyF/IyXp9W3+gqPsXaz/HUoY8x3vvq5qvisGwAAmLJdUjzREZe6eZ7u9GhV5Bhdz7AtJvH98VE9a/l1fu1y01DvbI31boorYhIAAKye/g8FGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDF4R+jXmXzPtXWsgAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAYCAYAAAAcYhYyAAAAoklEQVR4XmNgGAWUgvlAzIwuSCwoBOIHQFwExAJA/B9FlkTwB4i3oQsSC1KA+CMQ5wGxIgMRLkkE4mVAbIMuAQTzgJgRXRAdgGxQgLIrgbgKIUUc2AfEJ5D4IAM7kfhEgU8MEI2gaJRFkyMaaDJADIHh96jSpAEVIH7OQEQMoAOQhi9YxEgCIA2CSPw9QLwaiU8UcAHifwyI8ChGlR4FIxwAAGCHIPQFrjaHAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAmElEQVR4XmNgGDlgMxD/JwHDAYgThiwAFUNRBAQayGJCDBAbkQETA0TBBTRxEHgEY2wFYkYkCRAoYIBo9EcTZwPiPhgnH0kCBt4zYDoTBASAWBxdEBlg8x9BwMwA0XQGXYIQKGeAaPRGlyAEPjOQ4UwQIMt/oOAmy3+zGSAaE9DEsYIgIP7GAIm7t1AM8ucvBjKcPAoGBAAAiastbKanIo0AAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAZCAYAAAAMhW+1AAAAhElEQVR4XmNgGDzgBBD/AuL/QGyGJgcH/QwQBTjBYwYCCkCSh9AFkQFIgSO6IAwkM0AUNALxcygbxbSHUEELJDEQPwCZcxQhBxe7gsxpR8jBxV6AGJJQDg+SJCNUbCKIkwblIINSqJgqiGMH5SADEP8RugAMdKDxwUARKgjC29HkRgIAAFc5JozAqrYVAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAYCAYAAABnRtT+AAABiklEQVR4Xu2WzSsFYRTGD0kpC6WsWNvYKWsWlJ2V7Nj52FoqsZVk5R9g4S+wUyg7IYUksVGilCLk8zmdeW/Hc+feuU3X3LuYXz3NnOec7pz7znlnRiQnp75Zgp6gn0iv0CN554XqGhMaiuNdSucyRZvYYzOiVSy/QH6mjIk1McAJR7mVzoQzSW6g5k1W0kAlNf+KXnyHTceQWE3NdnmYx37yPZdiNR2cSMEMNEteE8VFXEjybdT8F5spGYVaXLwMrbo4lqRZC5uqkRNV4htqZ5PRBko9HxfF8j2cAL3QC7QJTTtfR+MU6oYOoAeXu4Weo3O97WGBVFOhiJkTKxgkf0TstfhBfmACunKx1ip3ztPfbYiOyqHzA21iKxnLmtiM+X/yKfb603f3BtRcqC5G63ehk+jITEJbbIJh+fuEWJEK5jEt5WZYuYf62ARvUKeLdaES5zEt3KTOoRJ8n99358Gfp3g8OlaVLrEL6ONr3fn6iXckttGuoWOXU3QT3bh4W2xc4jZmTk5d8QtatW0/xUfFTgAAAABJRU5ErkJggg==>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAABD0lEQVR4XmNgGAU0Aj+BmBNdkNqgCoj/A/FTdAlqA5AlMMyGJkc1UADEzUBcywCx6B6qNPUAyHBkNggzI4lRBSQDcTcSv4MBYtFVJDF0wA7Es4BYGUmMA4hXIPExALJvYADmK2xADohPMUAsQ1bzBMoHiWOAMCCeii4IBJMZIJpOoksAwR8onciAahEoqEF8FiQxOMDlahDA5asEKP2bAWEpDGBTz+ABxAvRBZHAfAaIxj3oElAAkstAE/uOxgcDrLajAVy+imbAFBcB4gA0MQYrIF6LLogFrGOAGIiudh5UHBk8R+ODAcylpGBk4IUm5gnEaUh8MAAlT3RDiMH9IM1IYBqSXC6a3CgYBcMZAACgGVTs5iAFHAAAAABJRU5ErkJggg==>