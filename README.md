# legal-relationship-diagram

法律关系图可视化编辑器。当前项目基于 React + TypeScript + SVG，可用于制作法律关系图、案件事实图、交易结构图、诉讼路径图和争议焦点图。

## 功能

- 节点拖拽、紫色关系标签拖拽
- 连线控制点拖拽，支持新增折点
- 标签可直接在图上编辑，支持鼠标拖拽调整大小
- 右侧中文属性面板，可修改节点、标签、线条颜色、线条粗细和路径
- 网格、吸附网格、自动对齐
- 撤销、重做
- JSON 导入 / 导出
- localStorage 本地保存
- SVG / PNG 导出

## 运行

```bash
pnpm install
pnpm run dev
```

## 构建

```bash
pnpm run build
```

## Skill

项目根目录的 `LEGAL_DIAGRAM_SKILL.md` 记录了后续复用这个编辑器生成法律关系图的标准工作流、数据维护规则和给 Codex 的提示词模板。
