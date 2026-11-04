// The final master: 3840×2160, 120 fps, HDR10 (10-bit HEVC, BT.2020, PQ), with the
// song's own mp3 frames as the audio track (not re-encoded). Needs an NVIDIA GPU:
// the libx265 bundled with Remotion is 8-bit only, its hevc_nvenc does Main 10.
//
//   node scripts/render_4k120.mjs                 everything; resumes finished parts
//   node scripts/render_4k120.mjs --concurrency=6 fewer browser tabs (less memory)
//   node scripts/render_4k120.mjs --range=0-599 --tag=test --with-audio   a short test
//   node scripts/render_4k120.mjs --regrade       only steps 2–4, from the kept parts
//
// Steps:
//  1 frames  Release120 at scale 2, in parts of PART_FRAMES (out/4k120/part_*.mp4).
//            A finished part is kept, so an interrupted render picks up where it
//            stopped. Chrome captures 8-bit sRGB, so the parts are near-lossless 4:4:4.
//  2 audio   95 silent mp3 frames, then the song's frames byte for byte. It is a
//            plain mp3 stream with no edit list, so every player starts it on time.
//  3 encode  sRGB → linear → highlight expansion → BT.2020 PQ → HEVC Main 10.
//  4 mux     HDR10 static metadata goes into the stream as SEI (NVENC has no option
//            for it here), then video and audio into one mp4.
//
// The picture is graded from 8-bit frames, so this is an HDR grade of an SDR render,
// not HDR-native rendering. Changing the grade only needs steps 2–4 (--regrade).
import fs from 'fs';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {RenderInternals, renderMedia, selectComposition} from '@remotion/renderer';

const arg = (name, def) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};
const flag = (name) => process.argv.includes(`--${name}`);
const COMP = 'Release120';
const SONG = path.resolve(arg('song', 'public/song.mp3'));
const DIR = path.resolve('out/4k120');
const TAG = arg('tag', 'final');
const OUT = path.resolve(arg('out', TAG === 'final' ? 'out/world-execute-me_4k120hdr.mp4' : `out/4k120/${TAG}.mp4`));
const PART_FRAMES = 2400;
const CONCURRENCY = Number(arg('concurrency', 8));
const IMAGE = arg('image', 'png');
const GL = arg('gl', null);

// ---- the grade. Linear RGB is scaled so its largest channel V becomes V^EXPONENT, which
// keeps every hue, then 1.0 is placed at PEAK_NITS. Below V = 0.05 the curve is linear,
// so the dark background stays where it is (about 1 nit). See README "4K 120 fps HDR".
const PEAK_NITS = 400;
const EXPONENT = 1.25;
// measured over the film's frames at this grade (README); they describe the content, not a display
const MAX_CLL = Number(arg('maxcll', 400));
const MAX_FALL = Number(arg('maxfall', 100));
const CQ = arg('cq', '16');

const ff = (bin, args, onLine) => {
  const task = RenderInternals.callFf({bin, args, indent: false, logLevel: 'error', binariesDirectory: null, cancelSignal: undefined});
  if (onLine) task.stderr?.on('data', (d) => onLine(String(d)));
  return task;
};
const partFile = (a) => path.join(DIR, `part_${TAG}_${String(a).padStart(6, '0')}.mp4`);

const renderParts = async (from, to) => {
  fs.mkdirSync(DIR, {recursive: true});
  const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
  const composition = await selectComposition({serveUrl, id: COMP});
  const last = to ?? composition.durationInFrames - 1;
  const parts = [];
  for (let a = from; a <= last; a += PART_FRAMES) {
    const b = Math.min(a + PART_FRAMES - 1, last);
    const file = partFile(a);
    parts.push(file);
    if (fs.existsSync(file + '.done')) {
      console.log(`part ${a}-${b}: already done`);
      continue;
    }
    const t0 = Date.now();
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: file,
      frameRange: [a, b],
      scale: 2,
      imageFormat: IMAGE,
      jpegQuality: 100,
      pixelFormat: 'yuv444p',
      colorSpace: 'bt709',
      crf: 8,
      x264Preset: 'veryfast',
      muted: true,
      concurrency: CONCURRENCY,
      chromiumOptions: GL ? {gl: GL} : undefined,
      timeoutInMilliseconds: 180000,
      logLevel: 'error',
      overwrite: true,
      onProgress: ({renderedFrames}) => {
        if (renderedFrames % 240 === 0 && renderedFrames) console.log(`  part ${a}: ${renderedFrames}/${b - a + 1} frames, ${(renderedFrames / ((Date.now() - t0) / 1000)).toFixed(1)} fps`);
      },
    });
    fs.writeFileSync(file + '.done', '');
    console.log(`part ${a}-${b}: ${((b - a + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps, ${(fs.statSync(file).size / 1e6).toFixed(0)} MB`);
  }
  return parts;
};

// 95 mp3 frames + the song's first-frame encoder delay (1105 samples) = 2.5067 s, so its
// first sample lands 6.7 ms after the 2.5 s notice card: under one frame at 120 fps.
const SILENT_FRAMES = 95;
const buildAudio = async () => {
  const silent = path.join(DIR, 'silence.mp3');
  const music = path.join(DIR, 'music.mp3');
  const out = path.join(DIR, 'audio.mp3');
  await ff('ffmpeg', ['-y', '-hide_banner', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '4', '-c:a', 'libmp3lame', '-b:a', '320k', '-write_xing', '0', '-id3v2_version', '0', silent]);
  await ff('ffmpeg', ['-y', '-hide_banner', '-i', SONG, '-map', '0:a:0', '-c:a', 'copy', '-write_xing', '0', '-id3v2_version', '0', music]);
  // CBR 320 kb/s at 44.1 kHz: frames are 1044 or 1045 bytes (the padding bit). Keep frames
  // from the middle of the silence, past the encoder's start.
  const buf = fs.readFileSync(silent);
  const skip = (pos, n) => {
    for (let i = 0; i < n; i++) {
      if (buf[pos] !== 0xff) throw new Error(`no mp3 sync at ${pos}`);
      pos += 1044 + ((buf[pos + 2] >> 1) & 1);
    }
    return pos;
  };
  const start = skip(0, 20);
  fs.writeFileSync(out, Buffer.concat([buf.subarray(start, skip(start, SILENT_FRAMES)), fs.readFileSync(music)]));
  return out;
};

const encode = async (parts, file) => {
  const list = path.join(DIR, `parts_${TAG}.txt`);
  fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  const vf = [
    `zscale=tin=iec61966-2-1:pin=709:min=709:rin=limited:t=linear:npl=${PEAK_NITS}`,
    'format=gbrpf32le',
    `tonemap=gamma:param=${1 / EXPONENT}:peak=1:desat=0`,
    `zscale=tin=linear:pin=709:npl=${PEAK_NITS}:t=smpte2084:p=2020:m=2020_ncl:r=limited:d=none`,
    'format=yuv420p10le',
    'format=p010le',
  ].join(',');
  const t0 = Date.now();
  let lastLog = 0;
  await ff(
    'ffmpeg',
    [
      '-y', '-hide_banner', '-loglevel', 'info', '-stats', '-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-vf', vf,
      '-fps_mode', 'passthrough', '-c:v', 'hevc_nvenc', '-preset', 'p7', '-tune', 'hq', '-rc', 'vbr', '-cq', CQ, '-b:v', '0', '-maxrate', '160M', '-bufsize', '240M',
      '-profile:v', 'main10', '-tier', 'high', '-level', '5.2', '-g', '240',
      // no B-frames: a raw HEVC stream has no timestamps, so remuxing it would show frames in decode order
      '-bf', '0', '-spatial_aq', '1', '-temporal_aq', '1', '-rc-lookahead', '32', '-multipass', 'fullres',
      '-color_primaries', 'bt2020', '-color_trc', 'smpte2084', '-colorspace', 'bt2020nc', '-color_range', 'tv', '-f', 'hevc', file,
    ],
    (line) => {
      if (Date.now() - lastLog > 30000 && /frame=/.test(line)) {
        lastLog = Date.now();
        console.log('  ' + line.trim().slice(-90));
      }
    },
  );
  console.log(`encoded in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
};

// ---- HDR10 static metadata as a prefix SEI NAL unit, before the first slice of every IRAP picture
const seiNal = () => {
  const u16 = (v) => [v >> 8, v & 255];
  const u32 = (v) => [v >>> 24, (v >> 16) & 255, (v >> 8) & 255, v & 255];
  // ST 2086: a P3-D65 mastering display, 1000 nits (G, B, R, white point; units of 0.00002)
  const mdcv = [13250, 34500, 7500, 3000, 34000, 16000, 15635, 16450].flatMap(u16).concat(u32(10000000), u32(1));
  const clli = [...u16(MAX_CLL), ...u16(MAX_FALL)];
  const rbsp = [137, mdcv.length, ...mdcv, 144, clli.length, ...clli, 0x80];
  const out = [0, 0, 0, 1, 0x4e, 0x01]; // start code, NAL header: PREFIX_SEI
  let zeros = 0;
  for (const b of rbsp) {
    if (zeros >= 2 && b <= 3) {
      out.push(3); // emulation prevention
      zeros = 0;
    }
    out.push(b);
    zeros = b === 0 ? zeros + 1 : 0;
  }
  return Buffer.from(out);
};
const injectSei = async (src, dst) => {
  const sei = seiNal();
  const out = fs.createWriteStream(dst);
  let carry = Buffer.alloc(0);
  let count = 0;
  for await (const chunk of fs.createReadStream(src, {highWaterMark: 1 << 24})) {
    const buf = carry.length ? Buffer.concat([carry, chunk]) : chunk;
    const end = buf.length - 6; // a start code and its NAL header must be whole to be read
    let copied = 0;
    for (let i = buf.indexOf(0x01, 2); i !== -1 && i < end; i = buf.indexOf(0x01, i + 1)) {
      if (buf[i - 1] !== 0 || buf[i - 2] !== 0) continue;
      const type = (buf[i + 1] >> 1) & 0x3f;
      if (type >= 16 && type <= 21 && buf[i + 3] & 0x80) {
        const at = i >= 3 && buf[i - 3] === 0 ? i - 3 : i - 2;
        out.write(buf.subarray(copied, at));
        out.write(sei);
        copied = at;
        count++;
      }
    }
    out.write(buf.subarray(copied, Math.max(copied, end)));
    carry = Buffer.from(buf.subarray(Math.max(copied, end)));
  }
  out.write(carry);
  await new Promise((r) => out.end(r));
  console.log(`HDR10 metadata in ${count} IRAP pictures (MaxCLL ${MAX_CLL}, MaxFALL ${MAX_FALL})`);
};

const mux = async (hevc, audio) => {
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', '120', '-fflags', '+genpts', '-f', 'hevc', '-i', hevc];
  if (audio) args.push('-i', audio);
  args.push('-map', '0:v:0');
  if (audio) args.push('-map', '1:a:0');
  args.push('-c', 'copy', '-tag:v', 'hvc1', '-movflags', '+faststart', OUT);
  await ff('ffmpeg', args);
  console.log(`${OUT} (${(fs.statSync(OUT).size / 1e6).toFixed(0)} MB)`);
};

const [from, to] = arg('range', '0').split('-').map(Number);
const list = path.join(DIR, `parts_${TAG}.txt`);
const parts = flag('regrade') ? fs.readFileSync(list, 'utf8').trim().split('\n').map((l) => l.slice(6, -1)) : await renderParts(from, to);
if (!flag('frames-only')) {
  const audio = TAG === 'final' || flag('with-audio') ? await buildAudio() : null;
  const hevc = path.join(DIR, `${TAG}.hevc`), tagged = path.join(DIR, `${TAG}.sei.hevc`);
  await encode(parts, hevc);
  await injectSei(hevc, tagged);
  await mux(tagged, audio);
  fs.rmSync(hevc);
  fs.rmSync(tagged);
}
console.log('done');
