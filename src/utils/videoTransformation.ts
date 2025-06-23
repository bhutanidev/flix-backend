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
    return new Promise<void>((resolve, reject) => {
      // ✅ Output directly to main directory (flat structure)
      const playlistFile = path.join(outputBaseDir, `${res.name}-index.m3u8`);
      
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
          // ✅ Flat naming: segments go directly in main folder
          `-hls_segment_filename ${path.join(outputBaseDir, `${res.name}-segment-%d.ts`)}`
        ])
        .output(playlistFile)
        .on('start', cmd => console.log(`🔧 Starting ${res.name}: ${cmd}`))
        .on('end', () => {
          console.log(`✅ ${res.name} HLS stream created`);
          
          // ✅ Update playlist info for flat structure
          const bandwidth = parseInt(res.bitrate.replace('k', '')) * 1000;
          variantPlaylistInfo.push(
            `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${res.width}x${res.height}\n${res.name}-index.m3u8`
          );
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

  // ✅ Write master playlist with flat references
  const masterManifest = ['#EXTM3U', '#EXT-X-VERSION:3', ...variantPlaylistInfo].join('\n');
  fs.writeFileSync(path.join(outputBaseDir, 'index.m3u8'), masterManifest);

  console.log('🎬 Master playlist created at:', path.join(outputBaseDir, 'index.m3u8'));
  console.log('📁 Flat structure generated - compatible with CloudFront signed cookies');
  
  return outputBaseDir;
};