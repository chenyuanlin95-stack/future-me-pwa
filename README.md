# Future Me · 21 天变更好

个人使用、mobile-first 的训练养成 Web App。沿用 `kit.html` 的纯 HTML/CSS/JavaScript 结构与颜色；本地可完全离线使用，也可连接 Supabase 私有云备份。

## 本地启动

需要 Node.js 20 或更新版本。在本目录运行：

```powershell
npm start
```

电脑打开 http://localhost:4173 。请通过服务器访问，不要直接双击 HTML（ES modules 需要 HTTP）。停止服务：终端中按 Ctrl+C。

## 手机预览

手机和电脑连接同一局域网，电脑保持服务运行。在手机浏览器打开 `http://电脑局域网IP:4173`。本次开发时检测到的地址是 `http://172.20.10.2:4173`，更换网络后 IP 可能改变。若无法连接，检查电脑防火墙是否允许 Node.js 在专用网络上通信，以及 Wi-Fi 是否开启设备隔离。

拍摄入口使用手机浏览器的文件相机选择器（`accept` + `capture`），并提供独立相册入口。实际调用方式依手机系统与浏览器而定，桌面模拟无法替代真机相机验证。需要长期使用时建议部署到固定 HTTPS 地址；当前 GitHub 私人仓库是源码存储，并不是已发布的网页。

数据按「设备 + 浏览器 + 网站地址」隔离。状态、照片、缩略图和上传的视频都保存在 IndexedDB，并主动申请持久存储。浏览器更新通常不会删除，但清除网站数据、换网址或换设备会。请在「我的 → 设置 → 下载完整备份」定期保存 JSON 备份；该备份包含私人照片和视频，请妥善保管。恢复入口在同一位置。

## Supabase 私有云备份

云端采用“本地优先、手动同步”：日常操作先原子写入 IndexedDB；需要备份时在设置页点击上传。断网不会影响训练和拍照，也不会在两个设备间静默覆盖数据。

1. 新建 Supabase 项目，在 Authentication 中创建自己的用户。建议关闭公开注册，只保留这个账号。
2. 在 SQL Editor 运行 [`supabase-setup.sql`](./supabase-setup.sql)。它会建立私有 bucket，并限制每个登录用户只能访问以自己 `auth.uid()` 开头的目录。
3. 在 Project Settings / API 中复制 Project URL 和 Publishable key（旧项目可能显示 anon key）。不要把 `service_role` key 填进浏览器。
4. App 中进入「我的 → 设置 → 私有云备份」，填写 URL、key、账号邮箱和密码并登录。
5. 点击“上传本机数据到云端”。换设备后先登录，再点击“从云端恢复到本机”。恢复会覆盖该浏览器现有数据，所以操作前建议先下载 JSON 备份。

Supabase 配置和登录 session 仅保存在当前浏览器；密码只用于登录请求，不会由 App 保存。云端 bucket 是 private，文件读取需要当前用户的 JWT，RLS 还会核对文件路径第一段必须等于该用户 ID。

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
