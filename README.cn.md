# zheyucao.com - 我的个人网站

这是 zheyucao.com 的源代码，基于 Astro 构建，内容以集合的形式存放，页面通过组件和布局渲染。

## 项目结构

- **src/pages/**: 页面壳文件，依赖视图模型提供数据并调用展示组件（`index.astro`, `projects.astro`, `timeline.astro`, `resume.astro`, `contact.astro`）。
- **src/components/**: UI 组件，按功能分组（如 `home/`, `projects/`, `timeline/`, `resume/`, `common/`）。
- **src/layouts/**: 页面布局（`Layout.astro`, `SubPageLayout.astro`）。
- **src/content/**: 内容集合（MDX/YAML frontmatter），对应分区、项目、时间线、简历、联系信息、UI 字符串，集合 schema 定义在 `src/content/config.ts`。
- **src/viewmodels/**: 视图模型，从内容集合读取并整理页面需要的数据。
- **src/config.ts**: 全站元数据与导航配置。
- **src/styles/**: 全局与特定样式文件。
- **src/content/resume-layout/default.json**: 控制简历分区顺序、主/侧栏位置、数据源映射。
- **public/**: 静态资源（图片、favicon）。

## 功能

- **主页**: 英雄、关于、精选项目、动态/荣誉、联系入口。
- **项目**: 基于 MDX 的项目条目，可排序、可设置精选。
- **时间线**: 内容集合提供事件，前端支持分类筛选。
- **简历**: 集合驱动的简历，使用通用区块组件渲染。
- **联系**: 独立的联系分区文件，可控制顺序与内容。
- **动画**: GSAP 驱动的滚动与显隐动画。

## 内容管理

- **全局配置**: `src/config.ts` 管理站点标题、描述、导航等。
- **内容集合**: 位于 `src/content/`（schema 定义在 `src/content/config.ts`），MDX 正文写文案，frontmatter 存放结构化字段（如链接、技术栈、排序、标记）。
- **视图模型**: `src/viewmodels/` 负责读取集合并为页面产出所需的 props。
- 更新文案或数据时，直接修改相应的内容文件即可，通常无需改动组件。

### 模板自定义建议

- **首页分区**: 在 `src/content/homepage-sections/` 中新增或编辑分区文件，通过 frontmatter 控制顺序与显隐。
- **项目/时间线/联系/简历内容**: 直接编辑 `src/content/` 对应集合目录。
- **简历布局**: 在 `src/content/resume-layout/default.json` 中调整分区顺序、主侧栏归属与数据来源。
- **页面元信息与按钮**: 编辑 `src/content/page-metadata/*.mdx`（`actions[].variant` 支持 `default`、`primary`、`subtle`）。
- **导航与站点信息**: 在 `src/config.ts` 修改。
- **新增页面**: 新建 `src/pages/<slug>.astro`，并在 `src/config.ts` 中加入导航，按需新增 `src/content/page-metadata/<slug>.mdx`。

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
| `pnpm check`           | 运行 Astro 类型与内容检查                      |
| `pnpm format`          | 使用 Prettier 格式化代码                       |
| `pnpm format:check`    | 检查代码格式而不进行更改                       |

## 依赖

- **Astro**: 用于构建网站的主要框架。
- **GSAP**: 用于动画。
- **ESLint & Prettier**: 用于代码检查和格式化。

## 使用指南

- **替换个人信息**: 您 **必须** 替换内容配置中的所有个人信息（例如 `src/content/`, `src/config.ts`, `src/content/footer/info.json` 等）。这包括但不限于：
  - 姓名
  - 个人简介或"关于我"部分
  - 联系信息（电子邮件、社交媒体链接）
  - 特定于原作者的项目描述和细节
  - 照片、头像或其他个人图片

**请勿假冒**: 请勿以暗示修改后的版本是原作者网站或您是原作者的方式展示。请明确区分您的网站和内容与原作。

**保留许可证**: 在更新内容时，请根据 MIT 许可证的要求，保留原始 `LICENSE` 文件或在您的衍生作品中包含原始版权声明和许可声明。

未能替换个人内容可能会对您和原作者造成误解。请负责任地使用此模板。
