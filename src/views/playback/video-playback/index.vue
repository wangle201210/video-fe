<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">视频回放</h1>
      <p class="text-gray-600">
        使用 Video.js 实现的专业视频播放器，支持倍速播放、音量控制等功能
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 视频播放器区域 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">视频播放器</h2>

          <!-- 视频选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              选择视频源
            </label>
            <el-select
              v-model="selectedVideo"
              placeholder="请选择视频"
              @change="changeVideo"
              class="w-full"
            >
              <el-option
                v-for="video in videoList"
                :key="video.id"
                :label="video.title"
                :value="video.url"
              />
            </el-select>
          </div>

          <!-- Video.js 播放器 -->
          <div class="mb-4">
            <video
              ref="videoRef"
              class="video-js vjs-theme-city"
              controls
              preload="auto"
              crossorigin="anonymous"
              data-setup="{}"
            >
              <p class="vjs-no-js">
                要查看此视频，请启用 JavaScript，并考虑升级到
                <a
                  href="https://videojs.com/html5-video-support/"
                  target="_blank"
                >
                  支持 HTML5 视频的浏览器
                </a>。
              </p>
            </video>
          </div>

          <!-- 播放控制按钮 -->
          <div class="flex flex-wrap gap-2">
            <el-button
              type="primary"
              :icon="isPlaying ? VideoPause : VideoPlay"
              @click="togglePlay"
            >
              {{ isPlaying ? "暂停" : "播放" }}
            </el-button>
            <el-button @click="stopVideo">停止</el-button>
            <el-button
              :icon="Mute"
              @click="toggleMute"
            >
              {{ isMuted ? "取消静音" : "静音" }}
            </el-button>
            <el-button :icon="FullScreen" @click="toggleFullscreen">
              全屏
            </el-button>
            <el-button
              type="success"
              :icon="Camera"
              @click="captureScreenshot"
            >
              截屏
            </el-button>
          </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              播放速度
            </label>
            <el-slider
              v-model="playbackRate"
              :min="0.25"
              :max="2"
              :step="0.25"
              :format-tooltip="(val: number) => `${val}x`"
              @change="changePlaybackRate"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              音量控制
            </label>
            <el-slider
              v-model="volume"
              :min="0"
              :max="100"
              :format-tooltip="(val: number) => `${val}%`"
              @change="changeVolume"
            />
          </div>
        </div>
        </div>
      </div>

      <!-- 视频信息面板 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold mb-4">视频信息</h3>
          
          <div v-if="videoInfo" class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">时长:</span>
              <span class="font-medium">
                {{ formatTime(videoInfo.duration) }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">当前时间:</span>
              <span class="font-medium">
                {{ formatTime(videoInfo.currentTime) }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">分辨率:</span>
              <span class="font-medium">
                {{ videoInfo.width }}x{{ videoInfo.height }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">播放状态:</span>
              <span
                class="font-medium"
                :class="isPlaying ? 'text-green-600' : 'text-gray-500'"
              >
                {{ isPlaying ? "播放中" : "已暂停" }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">音量状态:</span>
              <span
                class="font-medium"
                :class="isMuted ? 'text-red-600' : 'text-blue-600'"
              >
                {{ isMuted ? "已静音" : "正常" }}
              </span>
            </div>
          </div>
          
          <div v-else class="text-gray-500 text-center py-8">
            请选择并加载视频
          </div>
        </div>
        
        <!-- 截屏配置 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 class="text-lg font-semibold mb-4">截屏配置</h3>
          
          <div class="space-y-4">
            <!-- 保存目录设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                保存设置
              </label>
              <div class="flex items-center gap-3">
                <el-button
                  type="primary"
                  size="small"
                  @click="selectSaveDirectory"
                >
                  选择保存目录
                </el-button>
                <el-switch
                  v-model="screenshotConfig.autoSave"
                  active-text="自动保存"
                  inactive-text="手动下载"
                  :disabled="!screenshotConfig.saveDirectory"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">
                 {{
                   screenshotConfig.saveDirectory
                     ? `当前目录: ${screenshotConfig.saveDirectory.name}`
                     : "未设置保存目录，将使用浏览器下载"
                 }}
               </p>
            </div>
            
            <!-- 图片格式 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                图片格式
              </label>
              <el-radio-group v-model="screenshotConfig.format" size="small">
                <el-radio value="jpeg">JPEG</el-radio>
                <el-radio value="png">PNG</el-radio>
              </el-radio-group>
            </div>
            
            <!-- 图片质量 -->
            <div v-if="screenshotConfig.format === 'jpeg'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                图片质量: {{ Math.round(screenshotConfig.quality * 100) }}%
              </label>
              <el-slider
                v-model="screenshotConfig.quality"
                :min="0.1"
                :max="1"
                :step="0.1"
                :format-tooltip="(val: number) => `${Math.round(val * 100)}%`"
              />
            </div>
          </div>
        </div>
        
        <!-- 功能说明 -->
        <div class="bg-blue-50 rounded-lg p-4 mt-6">
          <h4 class="font-semibold text-blue-900 mb-2">功能特性</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• 支持多种视频格式</li>
            <li>• 倍速播放 (0.25x - 2x)</li>
            <li>• 音量控制和静音</li>
            <li>• 全屏播放</li>
            <li>• 智能截屏功能 (支持自动保存)</li>
            <li>• 实时播放信息</li>
            <li>• 响应式设计</li>
          </ul>
          <p class="text-xs text-blue-600 mt-3">
            基于 Video.js 8.x 构建，提供专业级视频播放体验。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import {
  VideoPlay,
  VideoPause,
  FullScreen,
  Mute,
  Camera
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/themes/dist/sea/index.css";
import type Player from "video.js/dist/types/player";

// 定义组件名称
defineOptions({
  name: "VideoPlayback"
});

// 响应式数据
const videoRef = ref<HTMLVideoElement>();
const player = ref<Player | null>(null);
const selectedVideo = ref("");
const playbackRate = ref(1);
const volume = ref(50);
const isPlaying = ref(false);
const isMuted = ref(false);
const videoInfo = ref<{
  duration: number;
  currentTime: number;
  width: number;
  height: number;
} | null>(null);

// 截屏配置
const screenshotConfig = ref({
  autoSave: false, // 是否自动保存到默认路径
  saveDirectory: null as FileSystemDirectoryHandle | null, // 保存目录句柄
  quality: 0.9, // 图片质量
  format: "jpeg" as "jpeg" | "png"
});

// 示例视频列表
const videoList = ref([
  {
    id: 1,
    title: "示例视频 1 - Big Buck Bunny",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: 2,
    title: "示例视频 2 - Elephant Dream",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: 3,
    title: "示例视频 3 - For Bigger Blazes",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  }
]);

// 初始化视频播放器
const initPlayer = async () => {
  await nextTick();
  
  if (videoRef.value) {
    player.value = videojs(videoRef.value, {
      controls: true,
      responsive: true,
      fluid: true,
      aspectRatio: "16:9",
      playbackRates: [0.25, 0.5, 1, 1.25, 1.5, 2],
      plugins: {}
    });

    // 监听播放器事件
    player.value.on("play", () => {
      isPlaying.value = true;
    });

    player.value.on("pause", () => {
      isPlaying.value = false;
    });

    player.value.on("volumechange", () => {
      if (player.value) {
        isMuted.value = player.value.muted();
        if (!isMuted.value) {
          volume.value = Math.round(player.value.volume() * 100);
        }
      }
    });

    player.value.on("timeupdate", () => {
      if (player.value && videoInfo.value) {
        videoInfo.value.currentTime = player.value.currentTime();
      }
    });

    player.value.on("loadedmetadata", () => {
      if (player.value) {
        videoInfo.value = {
          duration: player.value.duration(),
          currentTime: player.value.currentTime(),
          width: player.value.videoWidth(),
          height: player.value.videoHeight()
        };
      }
    });

    player.value.on("error", error => {
      console.error("视频播放错误:", error);
      ElMessage.error("视频加载失败，请检查视频源");
    });
  }
};

// 切换视频源
const changeVideo = () => {
  if (player.value && selectedVideo.value) {
    player.value.src({
      src: selectedVideo.value,
      type: "video/mp4"
    });
    player.value.load();
  }
};

// 切换播放/暂停
const togglePlay = () => {
  if (player.value) {
    if (player.value.paused()) {
      player.value.play();
    } else {
      player.value.pause();
    }
  }
};

// 停止播放
const stopVideo = () => {
  if (player.value) {
    player.value.pause();
    player.value.currentTime(0);
  }
};

// 切换静音
const toggleMute = () => {
  if (player.value) {
    player.value.muted(!player.value.muted());
  }
};

// 切换全屏
const toggleFullscreen = () => {
  if (player.value) {
    if (player.value.isFullscreen()) {
      player.value.exitFullscreen();
    } else {
      player.value.requestFullscreen();
    }
  }
};

// 改变播放速度
const changePlaybackRate = () => {
  if (player.value) {
    player.value.playbackRate(playbackRate.value);
  }
};

// 改变音量
const changeVolume = () => {
  if (player.value) {
    player.value.volume(volume.value / 100);
  }
};

// 选择保存目录
const selectSaveDirectory = async () => {
  try {
    if ("showDirectoryPicker" in window) {
      const directoryHandle = await (window as any).showDirectoryPicker();
      screenshotConfig.value.saveDirectory = directoryHandle;
      screenshotConfig.value.autoSave = true;
      ElMessage.success(`已设置保存目录: ${directoryHandle.name}`);
    } else {
      ElMessage.warning("当前浏览器不支持目录选择功能");
    }
  } catch (error) {
    console.error("选择目录失败:", error);
    ElMessage.error("选择目录失败");
  }
};

// 截屏功能
const captureScreenshot = async () => {
  if (!player.value || !videoRef.value) {
    ElMessage.warning("请先加载视频");
    return;
  }

  // 检查视频是否已加载
  if (videoRef.value.readyState < 2) {
    ElMessage.warning("视频还未加载完成，请稍后再试");
    return;
  }

  try {
    // 创建canvas元素
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      ElMessage.error("浏览器不支持Canvas");
      return;
    }

    // 获取视频的实际尺寸
    const video = videoRef.value;
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // 将当前视频帧绘制到canvas上
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 生成文件名（包含毫秒）
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, -1); // 保留毫秒部分
    const fileName = `video-screenshot-${timestamp}.${screenshotConfig.value.format}`;

    // 如果启用了自动保存且有保存目录
    if (
      screenshotConfig.value.autoSave &&
      screenshotConfig.value.saveDirectory
    ) {
      try {
        // 转换为Blob
        const blob = await new Promise<Blob>(resolve => {
          canvas.toBlob(
            blob => {
              resolve(blob!);
            },
            `image/${screenshotConfig.value.format}`,
            screenshotConfig.value.quality
          );
        });

        // 创建文件并写入
        const fileHandle =
          await screenshotConfig.value.saveDirectory.getFileHandle(fileName, {
            create: true
          });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        ElMessage.success(`截屏已保存到: ${fileName}`);
        return;
      } catch (error) {
        console.error("自动保存失败，使用下载方式:", error);
        ElMessage.warning("自动保存失败，使用下载方式");
      }
    }

    // 回退到下载方式
    const mimeType = `image/${screenshotConfig.value.format}`;
    const dataURL = canvas.toDataURL(mimeType, screenshotConfig.value.quality);

    // 创建下载链接
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataURL;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ElMessage.success("截屏成功！");
  } catch (error) {
    console.error("截屏失败:", error);
    if (error instanceof Error && error.message.includes("Tainted")) {
      ElMessage.error("截屏失败：视频源不支持跨域访问，请尝试其他视频源");
    } else {
      ElMessage.error("截屏失败，请重试");
    }
  }
};



// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// 生命周期
onMounted(() => {
  initPlayer();
});

onUnmounted(() => {
  if (player.value) {
    player.value.dispose();
  }
});
</script>

<style scoped>
.video-js {
  width: 100%;
  height: auto;
}

.vjs-theme-city {
  --vjs-theme-forest--primary: #409eff;
}
</style>
