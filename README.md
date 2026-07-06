# legal-relationship-diagram-studio

法律关系图可视化编辑器独立开发项目。

这个项目从原型版 `legal-relationship-diagram` 迁出，用于后续继续产品化开发。当前版本保留已经可用的核心能力：

- 节点拖拽
- 紫色关系标签拖拽、直接编辑、单独添加、鼠标调整大小
- 连线控制点拖拽、插入折点、自动对齐
- 中文属性面板
- 线条颜色、粗细、实线/虚线编辑
- JSON 导入 / 导出
- localStorage 本地保存
- SVG / PNG 导出
- 网格、吸附网格、撤销、重做

## 运行

```bash
pnpm install
pnpm run dev
```

## 构建

```bash
pnpm run build
```

## 项目定位

后续开发在本项目中进行，旧项目和旧资料目录保持不动。本项目目标是逐步拆分为更清晰的软件结构：

- 图数据模型
- SVG 画布
- 节点编辑
- 连线编辑
- 标签编辑
- 属性面板
- 导入导出
- 模板与法律关系图 skill

