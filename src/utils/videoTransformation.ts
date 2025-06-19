import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const resolutions = [
  { name: '360p', width: 640, height: 360, bitrate: '800k' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k' }
];

export const videoTransformation = async (filename: string, filepath: string) => {
  const baseName = path.parse(filename).name;
  const outputBaseDir = path.resolve('segments', baseName);

  if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir, { recursive: true });
  }

  const variantPlaylistInfo: string[] = [];

  const createVariant = (res: { name: string; width: number; height: number; bitrate: string }) => {
    const resDir = path.join(outputBaseDir, res.name);
    if (!fs.existsSync(resDir)) {
      fs.mkdirSync(resDir, { recursive: true });
    }

    return new Promise<void>((resolve, reject) => {
      ffmpeg(filepath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('hls')
        .size(`${res.width}x${res.height}`)
        .outputOptions([
          '-preset veryfast',
          '-g 48',
          '-sc_threshold 0',
          `-b:v ${res.bitrate}`,
          '-map 0:v:0',
          '-map 0:a:0?',
          '-hls_time 10',
          '-hls_list_size 0',
          `-hls_segment_filename ${path.join(resDir, `${baseName}-${res.name}-%d.ts`)}`
        ])
        .output(path.join(resDir, 'index.m3u8'))
        .on('start', cmd => console.log(`🔧 Starting ${res.name}: ${cmd}`))
        .on('end', () => {
          console.log(`✅ ${res.name} HLS stream created`);
          // Add to master playlist
          variantPlaylistInfo.push(`#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate) * 1000},RESOLUTION=${res.width}x${res.height}\n${res.name}/index.m3u8`);
          resolve();
        })
        .on('error', err => {
          console.error(`❌ Error generating ${res.name}: ${err.message}`);
          reject(err);
        })
        .run();
    });
  };

  // Generate all resolutions
  await Promise.all(resolutions.map(res => createVariant(res)));

  // Write master playlist
  const masterManifest = ['#EXTM3U', ...variantPlaylistInfo].join('\n');
  fs.writeFileSync(path.join(outputBaseDir, 'index.m3u8'), masterManifest);

  console.log('🎬 Master playlist created at:', path.join(outputBaseDir, 'index.m3u8'));
  return outputBaseDir
};
