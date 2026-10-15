# world.execute(me); — 非官方同人 MV 源码

Mili《world.execute(me);》的同人动画 MV。画面是一段 Claude 对话：输入框里是"你"的提示词，Claude 用歌词和代码回答。界面跟着歌曲从规整、异常、失控走到逐项删除。全片用 [Remotion](https://www.remotion.dev/)（React）以代码生成，输出 1920×1080、30 fps，片长 3:45。

> 本视频源代码由 Claude Opus 5.5 独立完成，为非官方同人作品，与 Mili、Anthropic、OpenAI 均无关联。
>
> - Claude 虚拟形象原案：Bilibili@ZipZipPipe
> - 歌曲《world.execute(me);》原作：Mili
> - 人物素材：由 Claude 调用 ChatGPT 生成

创作过程中每一轮的对话记录见 [CONVERSATION.md](CONVERSATION.md)。

---

## 仓库里没有的东西

- **歌曲音频。** 有版权，不随仓库提供。请自行购买正版（例如 Mili 的 Bandcamp），转成 mp3 后放到 `public/song.mp3`，详见下面第 3 步。
- **原始歌词文件（.lrc）。** 也没有放进仓库。画面里显示的英文歌词写在源码中，中文字幕已经做好，在 `subtitles/` 里。
- **渲染出来的视频。** 按下面的步骤在本地生成。

## 准备

| 需要 | 说明 |
|---|---|
| [Node.js](https://nodejs.org/) 18 或更新版本 | 已用 Node 22 测试。安装时保留 npm。 |
| 约 1 GB 硬盘空间 | 依赖约 500 MB，渲染出的原画质视频约 110 MB。 |
| 网络 | `npm install` 和第一次渲染需要联网。第一次渲染时 Remotion 会自动下载一个无界面版 Chrome。 |

不需要另外安装 ffmpeg，Remotion 自带。Windows、macOS、Linux 都可以运行。

## 在本地生成视频

### 1. 下载源码

```bash
git clone https://github.com/Starverse032/world.execute-me-.git
cd world.execute-me-
```

不用 git 的话，点 GitHub 页面上的 **Code → Download ZIP**，解压后在这个文件夹里打开终端。Windows 上可以用 PowerShell，在文件夹空白处按住 Shift 再右键，选"在此处打开 PowerShell 窗口"。

### 2. 安装依赖

```bash
npm install
```

### 3. 放入音频

把歌曲的 mp3 复制到 `public/` 文件夹，并改名为 `song.mp3`：

```
public/song.mp3
```

音频必须是完整的原曲（约 3:32），从第 0 秒开始，不能剪掉开头。画面里所有节拍和歌词都按原曲的时间轴对齐。

### 4. 预览（可选）

```bash
npm run studio
```

浏览器会打开 Remotion Studio（通常是 http://localhost:3000）。在左边选 **Release** 就能边拖时间轴边预览。预览只是看效果，导出视频请用下一步。

### 5. 渲染

```bash
npm run render
```

渲染完成后，成片在 `out/world-execute-me.mp4`，规格如下：

- 1920×1080，30 fps；
- 3:45 长，结构是 6 秒无声片头、3:32 正片、7 秒无声片尾；
- H.264 编码，crf 18，约 110 MB。

渲染时间取决于 CPU，4 核机器大约 7 分钟。终端会显示进度。

### 6. 加上中文字幕

把 `subtitles/world.execute(me)_zh.srt` 复制到视频旁边，改成和视频同名（例如 `world-execute-me.srt`）。大多数播放器（PotPlayer、VLC、IINA 等）会自动加载。这份字幕的时间轴已经包含 6 秒片头。

### 7. 压缩（可选）

原画质文件较大。想要更小的文件，可以用 Remotion 自带的 ffmpeg 压一遍，下面的码率出来约 24 MB：

```bash
npx remotion ffmpeg -i out/world-execute-me.mp4 -c:v libx264 -b:v 740k -c:a aac -b:a 112k out/world-execute-me_small.mp4
```

## 其他可渲染的版本

`npx remotion render src/index.ts <名字> out/<文件名>.mp4` 可以单独渲染下面任意一个：

| 名字 | 内容 |
|---|---|
| `Release` | 最终版：片头声明 + 正片 + 片尾署名（`npm run render` 渲染的就是它） |
| `FullMV2` | 只有正片（3:32，v2），`npm run render:mv` |
| `IntroCard` / `OutroCard` | 只有片头或片尾卡片（无声） |
| `FullMV` | 完整版 v1（被 v2 取代的上一版） |
| `DemoV3` | 定稿前的 46 秒风格 demo |
| `V4Kit` | v2 界面组件一览，开发用 |

## 目录结构

```
src/
  index.ts, Root.tsx      注册所有 composition
  v4/                     最终版（v2）
    Release.tsx           片头 + 正片 + 片尾
    Cards.tsx             无声片头、片尾卡片
    FullMV2.tsx           正片入口
    timeline.ts           五段的时间划分
    chaos.ts              "异常程度"曲线，界面随它逐渐失控
    shell/                界面组件：窗口、对话、代码、输入框、侧栏、状态行、网格…
    char/LineArt.tsx      人物线稿的绘制与揭示
    sections/S0–S4        五个段落（开场 / 主歌副歌 / 孤立 / 执行 / 结尾）
  v3/                     上一版（v1）和共用的颜色、字体、节拍、几何工具
  beats.json              全曲节拍点（130 BPM）
public/
  la/                     人物线稿（ChatGPT 生成，已处理成透明底的米白墨线）
  char/                   v1 用的人物素材
  fonts3, fonts4, fonts5  子集化后的字体（JetBrains Mono、Newsreader、STIX Two、Noto Sans SC）
subtitles/                中文字幕
docs/                     设计文档：分镜、规格、框架 API、改版方案
scripts/                  素材处理脚本（见下）
```

## 进阶：重新处理素材

以下脚本只在修改素材时才需要，渲染视频用不到。Python 脚本需要 Python 3.10+，并安装依赖：

```bash
pip install numpy pillow scikit-image scipy opencv-python
```

| 脚本 | 用途 |
|---|---|
| `scripts/lineart.py`、`scripts/la_all.sh` | 把 ChatGPT 生成的黑白线稿转成 `public/la/` 里的矢量笔画和墨线图。用法：`bash scripts/la_all.sh <放 la_*.png 的文件夹>` |
| `scripts/char_v3.py` | v1 的扁平色块人物处理 |
| `scripts/beats_full.py` | 从音频检测节拍，生成 `src/beats.json`。需要 `public/song.mp3` 和系统 ffmpeg |
| `scripts/make_srt_full.py` | 用 LRC 和 `docs/lyrics_zh.json` 生成中文字幕。需要你自己的 LRC 文件，放在 `docs/lyrics.lrc` |
| `scripts/stills.mjs` | 批量导出单帧截图，用来检查画面：`node scripts/stills.mjs Release 0.5 300 900 1800` |
| `scripts/fetch_fonts_v3.py` | 重新下载 v1 的子集字体 |

## 常见问题

- **渲染报错，提到 `song.mp3` 找不到或 404。** 第 3 步的音频没有放好。检查文件是否在 `public/song.mp3`，名字是否完全一致。
- **Chrome 下载失败。** 网络不通时，可以指定本机已安装的 Chrome 或 Chromium：
  ```bash
  npx remotion render src/index.ts Release out/world-execute-me.mp4 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
  ```
- **内存不足或电脑很卡。** 在渲染命令后加 `--concurrency=2`，减少同时渲染的帧数。
- **画面和音乐对不上。** 你的音频和原曲长度或开头不同，比如前面多了静音，或者用的是剪辑版。请换成完整原曲。
