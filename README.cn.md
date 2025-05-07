# zheyucao.com - 我的个人网站

这是 zheyucao.com 个人网站的源代码，使用 Astro 构建。它既是一个个人网站，也可以作为创建你自己网站的模板。

## 项目结构

- **src/pages/**: 包含网站的主要页面。
  - `index.astro`: 主页，包含英雄区、关于区、项目预览和联系区。
  - `projects.astro`: 项目完整列表。
  - `timeline.astro`: 时间线事件。
  - `resume.astro`: 简历页面。
  - `contact.astro`: 联系信息。
- **src/components/**: 可复用的UI组件。
  - `Footer.astro`: 页脚组件。
  - `ScrollIndicator.astro`: 滚动指示器组件。
  - `DynamicBackground.astro`: 动态背景组件。
  - 页面特定组件的子目录（例如 `home/`, `projects/`, `timeline/`, `resume/`, `common/`）。
- **src/layouts/**: 页面布局。
  - `Layout.astro`: 主布局。
  - `SubPageLayout.astro`: 子页面布局。
- **src/data/**: 项目和时间线事件的结构化数据。
  - `projectsData.ts`: 项目数据。
  - `timelineEvents.ts`: 时间线事件数据。
- **src/styles/**: CSS样式。
  - `timeline.css`: 时间线页面的样式。
- **public/**: 静态资源。
  - `images/`: 网站使用的图片。
  - `favicon.png`: 网站的favicon。
- **utils/**: 工具函数和脚本。

## 功能

- **主页**: 包含英雄区、关于区、项目预览和联系区。
- **项目页面**: 显示项目的完整列表。
- **时间线页面**: 显示时间线事件。
- **简历页面**: 简历专用页面。
- **联系页面**: 联系信息。
- **动画**: 使用GSAP进行动画，包括滚动触发效果。

## 内容管理

- 项目和时间线事件通过 `src/data/` 中的结构化数据文件进行管理。
- 未来计划包括使用Astro内容集合进行更动态的内容管理。

## 开发

### 前提条件

- Node.js
- pnpm

### 安装

```bash
pnpm install
```

### 可用脚本

| 命令                   | 操作                                           |
| :--------------------- | :--------------------------------------------- |
| `pnpm dev`             | 在 `localhost:4321` 启动本地开发服务器         |
| `pnpm build`           | 构建生产站点到 `./dist/` 目录                  |
| `pnpm preview`         | 在部署前本地预览构建结果                       |
| `pnpm astro ...`       | 运行 CLI 命令，例如 `astro add`, `astro check` |
| `pnpm astro -- --help` | 获取 Astro CLI 使用帮助                        |
| `pnpm lint`            | 运行 ESLint 检查代码问题                       |
| `pnpm lint:fix`        | 自动修复 ESLint 问题                           |
| `pnpm format`          | 使用 Prettier 格式化代码                       |
| `pnpm format:check`    | 检查代码格式而不进行更改                       |

## 依赖

- **Astro**: 用于构建网站的主要框架。
- **GSAP**: 用于动画。
- **ESLint & Prettier**: 用于代码检查和格式化。

## 使用指南

- **替换个人信息**: 您 **必须** 替换在内容文件（例如 `src/pages/`, `src/components/`, `src/data/` 等）中的所有个人信息。这包括但不限于：
  - 姓名
  - 个人简介或"关于我"部分
  - 联系信息（电子邮件、社交媒体链接）
  - 特定于原作者的项目描述和细节
  - 照片、头像或其他个人图片

**请勿假冒**: 请勿以暗示修改后的版本是原作者网站或您是原作者的方式展示。请明确区分您的网站和内容与原作。

**保留许可证**: 在更新内容时，请根据 MIT 许可证的要求，保留原始 `LICENSE` 文件或在您的衍生作品中包含原始版权声明和许可声明。

未能替换个人内容可能会对您和原作者造成误解。请负责任地使用此模板。
