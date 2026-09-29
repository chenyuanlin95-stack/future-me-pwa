# Future Me · 21 天变更好

个人使用、mobile-first 的训练养成 Web App。沿用 `kit.html` 的纯 HTML/CSS/JavaScript 结构与颜色；本地可完全离线使用，也可连接 Supabase 私有云备份。

正式 PWA：<https://chenyuanlin95-stack.github.io/future-me-pwa/>

私有源码仓库保留完整开发历史；公开的 `future-me-pwa` 仓库只用于 GitHub Pages 静态部署。发布新版时同一个提交需要同步推送到 `origin/main` 和 `pages/main`，正式网址保持不变，本机 IndexedDB不会因部署更新而更换 origin。

## 本地启动

需要 Node.js 20 或更新版本。在本目录运行：

```powershell
npm start
```

电脑打开 http://localhost:4173 。请通过服务器访问，不要直接双击 HTML（ES modules 需要 HTTP）。停止服务：终端中按 Ctrl+C。

## 手机预览

手机和电脑连接同一局域网，电脑保持服务运行。在手机浏览器打开 `http://电脑局域网IP:4173`。本次开发时检测到的地址是 `http://172.20.10.2:4173`，更换网络后 IP 可能改变。若无法连接，检查电脑防火墙是否允许 Node.js 在专用网络上通信，以及 Wi-Fi 是否开启设备隔离。

拍摄入口使用手机浏览器的文件相机选择器（`accept` + `capture`），并提供独立相册入口。实际调用方式依手机系统与浏览器而定，桌面模拟无法替代真机相机验证。需要长期使用时建议部署到固定 HTTPS 地址；当前 GitHub 私人仓库是源码存储，并不是已发布的网页。

### iPhone 主屏幕 PWA

项目已包含 `manifest.webmanifest`、独立主屏幕图标和离线 `service-worker.js`，显示模式为 `standalone`。正式部署后，请在 Safari 打开固定 HTTPS 地址，通过“分享 → 添加到主屏幕”安装，并始终从主屏幕图标进入。应用启动时会调用 `navigator.storage.persist()` 请求持久存储；正常发布新版只更新程序缓存，不清除 IndexedDB 媒体库。Safari 标签页与主屏幕 Web App 可能拥有不同的网站数据空间，因此安装后不要交替把两者当成同一个数据入口。

iOS 17及以上会按设备空间为每个 origin 计算配额，主屏幕 Web App可以申请 persistent 模式，但本机存储仍不等于设备备份：卸载并清除 Web App、清除网站数据或手机损坏仍会删除本机媒体。长期使用必须保持相同协议、域名和端口；`localhost`、局域网 IP和正式域名属于三个不同 origin。

数据按「设备 + 浏览器 + 网站地址」隔离。状态、照片、缩略图和上传的视频都保存在 IndexedDB，并主动申请持久存储。浏览器更新通常不会删除，但清除网站数据、换网址或换设备会。请在「我的 → 设置 → 下载完整备份」定期保存 JSON 备份；该备份包含私人照片和视频，请妥善保管。恢复入口在同一位置。

## Supabase 私有云备份

云端采用“本地优先、自动同步”：日常操作先原子写入 IndexedDB，登录后再延迟约 2.5 秒自动同步训练状态、金币、猫猫、回答、设置和媒体索引。断网不会影响训练和拍照；下次打开或再次修改时会继续尝试同步。照片和视频文件默认仍留在本机，不占用云端文件额度。

1. 新建 Supabase 项目，在 Authentication 中创建自己的用户。建议关闭公开注册，只保留这个账号。
2. 在 SQL Editor 运行 [`supabase-setup.sql`](./supabase-setup.sql)。它会建立私有 bucket，并限制每个登录用户只能访问以自己 `auth.uid()` 开头的目录。
3. 在 Project Settings / API 中复制 Project URL 和 Publishable key（旧项目可能显示 anon key）。不要把 `service_role` key 填进浏览器。
4. App 中进入「我的 → 设置 → 私有云备份」，填写 URL、key、账号邮箱和密码并登录。
5. 登录后自动同步即开启。“立即同步状态”用于主动检查；“用云端状态恢复本机”只覆盖进度数据，不删除本机媒体文件。

状态使用 `userId/apps/future-me/latest.json` 保存，并每天最多生成一个带时间的历史快照。每份状态包含 `schemaVersion` 和 `_updatedAt`，启动时会比较本机与云端更新时间；代码更新继续沿用同一份 IndexedDB，并通过 `migrateState()` 迁移旧结构。

本机还带有自动更新保护。`storage.js` 的 `DATA_BUILD` 发生变化时，启动过程会先把升级前状态放进 IndexedDB 的 `snapshots` store，再执行迁移，只保留最近 5 份状态快照。媒体 Blob 不因代码升级移动或重命名；启动时会核对所有媒体索引，找不到文件时只记录异常，不会删除照片记录或训练历史。涉及数据结构的大改应同时升级 `DATA_BUILD` 和 `model.js` 的 `version`，并在 `migrateState()` 中添加兼容迁移。

Supabase 配置和登录 session 仅保存在当前浏览器；密码只用于登录请求，不会由 App 保存。云端 bucket 是 private，文件读取需要当前用户的 JWT，RLS 还会核对文件路径第一段必须等于该用户 ID。用户名和密码无法恢复被系统清除的本机媒体，因此换手机或清除网站数据前仍应导出完整备份。

## 已实现

- 首页：按 Training Day 保存正面/侧面/背面/视频；上传后确认、构图线、上次照片 Ghost Overlay、缩略图墙；任意两天支持并排、触摸滑杆和透明叠图对比。
- 今日计划：已经录入本次提供的 Day 1–21 训练表。正面照确认后解锁；任务视频可上传到本机或保存 B 站/其他链接，同名训练自动复用该来源。
- 金币：Chapter 开始时生成 21 个隐藏红包，金额有随机感且总和严格等于 300；领取与余额写入同一事务。
- 猫猫：R 12 / S 8 / SSR 4，概率 80/17/3；单抽 1 coin，十连 9 coins并显示完整十只；角色唯一保存，重复只增加 `duplicateCount`；连续 49 抽无 SSR 后第 50 抽必出。
- 断训与恢复：按设备当地日期 24:00 判断；每个漏训日排队一只 HOME 猫出走；两张请假条和计划休息日免罚；连续完成 5 个计划训练日让一只 AWAY 猫回家，没有 AWAY 猫时发一张召回券。
- 我的：头像、用户名、金币、完成训练日、猫窝数量、21 个问题的解锁/回答/跳过/补答。
- IndexedDB：状态和 Blob 媒体持久化，照片最长边压缩到 1600px，视频约 60 秒以内、100MB 上限；状态与媒体同事务落盘，失败不解锁；领取奖励与扣费是原子事务，防重复。

## 替换正式训练内容

编辑 `config.js` 中 `PLANS`。每个 Day 可以拥有不同任务列表：

```js
{
  day: 1,
  question: '你的人生问题',
  placeholder: false,
  tasks: [{
    id: 'warmup', // 发布后保持稳定，完成记录按 ID 保存
    name: '热身运动', minutes: 5,
    description: '简单说明', encouragement: '今天也要加油呀！',
    url: 'https://视频页面链接',
    embedUrl: '' // 可嵌入的播放器地址；不可嵌入时留空，使用 url 跳转
  }]
}
```

任务和分钟数已经按本次提供的 21 天计划录入；21 个问题沿用现有文案。没有加入 RPE、疼痛/心情反馈、问卷或饮食。

`CONFIG.reward` 控制 21 天总池、单日最小/最大值；`generateRewardPool()` 负责生成并保证总和严格为 300。`CONFIG.draw.weights` 修改 R/S/SSR 概率，`CONFIG.draw.pity` 修改保底次数，`singlePrice` / `tenPrice` 修改价格。休息日默认无，可在「我的 → 设置」指定。

## Debug Panel

只在地址末尾加 `?debug=1` 时显示，例如 `http://localhost:4173/?debug=1`。入口在「我的」页面底部；普通地址不会渲染 Debug Panel。支持加金币、pity=49、断训/完成/5连胜、请假条、随机猫，以及生成 Day 1/7/14/21 Mock 照片和清空照片。

## 结构

- `index.html`：入口；`base.css`：继承原 HTML 的样式；`styles.css`：手机布局与参考图风格。
- `app.js`：四页和交互；`model.js`：训练、奖励、抽猫、休息/断训逻辑。
- `storage.js`：IndexedDB 数据访问边界，后续接 Supabase 可替换这一层。
- `cloud.js`：Supabase Auth 与私有 Storage 手动上传/恢复；不包含管理权限密钥。
- `supabase-setup.sql`：私有 bucket 与用户目录 RLS 策略。
- `config.js`：每日任务、问题、数值与素材裁切坐标。
- `assets/art-sheet.png`：用户提供的素材总览图；当前通过 CSS 定位显示局部。正式独立 PNG 到位后可替换 `art()`。

## 验证

```powershell
npm test
```

覆盖严格 300 金币、红包防重复、价格、十连、50 抽保底、角色唯一重复计数、出走队列、请假、休息、5 连胜回归和召回券。照片与手机交互验收见 `QA.md`。
