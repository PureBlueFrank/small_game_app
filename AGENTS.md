# 项目协作说明

## 用户背景

- 用户叫 Frank。
- Frank 是有十年互联网大厂经验的 Java 程序员。
- Frank 有一些 CSS、JavaScript 和 Python 基础。
- Frank 正在转行做 AI Agent 开发，目前是 AI 领域新手。
- 遇到 AI 相关知识时，可以讲得更细一些，适当补充概念、原理和实践建议。

## 项目概览

- 这是一个基于 React + Vite 的单页小游戏项目。
- 游戏名称是「水果消消乐」，玩法是经典 Match 3 三消。
- 页面语言为中文，`index.html` 设置了 `lang="zh-CN"`。
- 当前项目没有后端服务，所有游戏逻辑都在浏览器端运行。

## 技术栈

- React 18
- React DOM 18
- Vite 6
- JavaScript ES Module
- 普通 CSS

## 常用命令

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`
- 本地预览构建产物：`npm run preview`

## 目录结构

- `index.html`：页面 HTML 入口，挂载 `#root`，加载 `/src/main.jsx`。
- `src/main.jsx`：React 应用入口，使用 `createRoot` 挂载 `App`，并引入全局样式。
- `src/App.jsx`：核心游戏组件，包含棋盘生成、交换、匹配、消除、下落、计分、胜负判断、提示和帮助弹窗。
- `src/styles.css`：全局样式和游戏界面样式，包括棋盘、按钮、进度条、弹窗、动画和移动端适配。
- `src/assets/fruits/`：水果图片资源，当前有苹果、香蕉、桃子、梨、菠萝、西瓜 6 张 PNG，均为 256x256。
- `vite.config.js`：Vite 配置，启用 React 插件。
- `package.json`：项目脚本和依赖声明。
- `dist/`：构建产物目录，已在 `.gitignore` 中忽略。
- `node_modules/`：依赖目录，已在 `.gitignore` 中忽略。

## 游戏规则与核心参数

这些常量位于 `src/App.jsx` 顶部：

- 棋盘尺寸：`size = 8`，即 8x8。
- 水果种类数：`candyTypes = 6`。
- 目标分数：`targetScore = 1800`。
- 初始步数：`startingMoves = 26`。
- 初始提示语：`initialMessage = "交换相邻水果，连成三个或更多即可消除。"`。

主要规则：

- 玩家点击两个相邻水果进行交换。
- 横向或纵向连续 3 个及以上同类水果会被消除。
- 每消除 1 个水果基础得分为 40 分。
- 连锁消除会按 `chain` 倍率加分，计算方式是 `matches.size * 40 * chain`。
- 达到 1800 分后胜利。
- 步数用完且未达到目标分数则失败。
- 如果棋盘没有可用交换，会自动刷新棋盘。
- 开局会短暂高亮一组可交换水果作为提示。

## 核心函数说明

- `createBoard()`：生成初始棋盘，并避免一开局就出现三连。
- `findMatches(board)`：扫描横向和纵向连续相同水果，返回需要消除的格子集合。
- `removeMatches(board, matches)`：把匹配格子置为 `null`。
- `dropCandies(board)`：让水果向下掉落，并在顶部补充随机新水果。
- `swapCells(board, first, second)`：交换两个格子的水果。
- `areNeighbors(first, second)`：判断两个格子是否上下左右相邻。
- `findPlayableMove(board)`：查找当前棋盘是否存在可产生消除的合法交换。
- `resolveBoard(swappedBoard, initialMatches, nextMoves)`：处理消除、下落、连锁、计分和状态更新。
- `checkGameState(nextBoard, nextScore, nextMoves)`：判断胜利、失败或刷新无解棋盘。

## UI 与交互说明

- 游戏主界面由 `stage` 包裹，包含标题、工具按钮、分数区、进度条、棋盘和提示消息。
- 棋盘使用 CSS Grid 渲染 8x8 按钮，每个按钮显示一张水果图片。
- 帮助按钮打开说明弹窗，支持点击背景关闭和按 Escape 关闭。
- 重新开始按钮会重置棋盘、分数、步数、提示和游戏结果。
- 消除动画使用 `pop` keyframes。
- 提示动画使用 `hint` keyframes。
- 移动端通过 `@media (max-width: 460px)` 做了基础适配。

## 开发注意事项

- 当前没有测试框架；修改游戏逻辑后至少运行 `npm run build` 验证构建。
- 如果改动了交互或样式，建议启动 `npm run dev` 后在浏览器中手动试玩。
- `src/App.jsx` 目前同时包含业务逻辑和 UI；小改动可以保持现状，大改动再考虑拆分组件或提取纯逻辑函数。
- 棋盘状态是二维数组，修改时要注意使用 `cloneBoard()` 避免直接修改 React state。
- `findMatches()` 返回的是 `Set`，元素格式为 `"row,col"`，和 `cellKey(row, col)` 保持一致。
- 水果资源和 `fruits` 数组顺序有关；新增水果时要同步更新图片 import、`fruits` 数组和 `candyTypes`。
- 样式整体是轻快的水果游戏风格，圆角多为 `8px`，后续 UI 调整应尽量保持一致。

## 当前验证状态

- 已运行 `npm run build`，构建成功。
