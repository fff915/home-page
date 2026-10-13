# fff.plus 作品展示

面向手机与桌面的个人作品展示页。首页打开后默认静音循环播放《单词登科》的 Unity 实机运行录制，可暂停、开启声音或放大观看。互动数据来自本地模拟流，不代表真实直播间观众。网页用于展示，不在浏览器运行 Windows EXE。

页面以手机展示为主：顶部提供三个作品的快捷入口，每个作品只保留名称和一句简介。游戏控制区在常见手机首屏内，第二个项目使用“赛事看板”作为展示名称，第三个项目为《桌面养鱼》。页面标题、正文和预览弹窗不显示域名，访问链接仍可正常打开原站。

## 本地运行

```sh
npm ci
npm run dev
npm run build
```

入口为 `src/App.vue`，样式为 `src/portfolio.css`。构建静态资源只使用 `site-public/`，保留的旧版 `public/`、组件和配置不再被首页加载或发布。

## 演示资源

- `site-public/media/word-dengke-demo-v1.mp4`：1.0.23 原生开发构建自动运行流程，H.264/AAC，竖屏。
- `site-public/media/word-dengke-poster.webp`：演示封面。
- `site-public/media/word-dengke-share.jpg`：分享图片。

使用 `autoplay muted loop playsinline`，打开即播放，不依赖外部视频平台或在线字体。浏览器限制自动播放时显示“开始观看”；视频请求失败时显示明确提示。声音需要用户主动开启。

## 第二个项目：tc888.one

`src/data/projects.js` 的 `websiteProject` 管理第二个项目。展示 2026-10-13 从公开首页只读截取的桌面、手机截图，支持放大查看，并以新标签页打开 https://tc888.one/。截图中的赛程是拍摄时的页面内容，不作为实时数据。

tc888.one 的响应包含 `X-Frame-Options: DENY` 和 CSP `frame-ancestors 'none'`，因此使用本地截图，不使用 iframe。此次仅修改 `home-page`，不修改 tc888.one 的文件、配置或仓库，也不代理它的页面。截图位于 `site-public/media/tc888-home-*-20261013.jpg`。

## 第三个项目：桌面养鱼

`src/data/projects.js` 的 `aquariumProject` 管理内容，`src/components/AquariumShowcase.vue` 展示水景、小丑鱼互动、鲨鱼互动、收藏繁殖四组画面。进入可见区域后自动轮播，支持暂停、手动切换和放大；放大后的宽幅截图可以横向滑动查看。页面仅展示既有游戏画面，不提供浏览器试玩。

素材只读来自用户指定的 `E:\桌面养鱼\output`：`petting-native-water.png`、`warehouse-market-28-preview.png`、`petting-contact-v2-ClownHappy-native.gif`、`petting-contact-v4-SharkBite-native.gif`。转换后的 WebP 与 H.264 文件另存于本站 `site-public/media/aquarium-*`。两段动图来自原项目既有的 Unity Player 实际渲染记录，仅转为网页视频格式；收藏截图取左上方 1234 × 604 的繁殖与仓库区域，不改动原图。此次未启动原游戏或编辑器，未写入原游戏目录、构建或存档。

## 发布

仓库 `fff915/home-page` 的 `main` 分支已连接 Cloudflare Pages。构建命令继续使用 `npm run build`，发布目录继续使用 `dist`。提交到 `main` 后由现有 Pages 集成部署，域名为 https://fff.plus/。无需创建新的 Worker 或改动域名绑定。

原模板的 LICENSE 保留。旧站内容可从 Git 历史恢复。
