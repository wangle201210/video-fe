<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">视频回放</h1>
      <p class="text-gray-600">使用 Video.js 实现的专业视频播放器，支持倍速播放、音量控制等功能</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 视频播放器区域 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">视频播放器</h2>
          
          <!-- 视频选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择视频源</label>
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
              data-setup="{}"
            >
              <p class="vjs-no-js">
                要查看此视频，请启用 JavaScript，并考虑升级到
                <a href="https://videojs.com/html5-video-support/" target="_blank">
                  支持HTML5视频的网络浏览器
                </a>。
              </p>
            </video>
          </div>

          <!-- 播放控制按钮 -->
          <div class="flex flex-wrap gap-3 mb-4">
            <el-button 
              type="primary" 
              @click="togglePlay"
              :icon="isPlaying ? VideoPause : VideoPlay"
            >
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            
            <el-button 
              @click="stopVideo"
              icon="VideoStop"
            >
              停止
            </el-button>
            
            <el-button 
              @click="toggleMute"
              :icon="isMuted ? 'Mute' : Mute"
            >
              {{ isMuted ? '取消静音' : '静音' }}
            </el-button>
            
            <el-button 
              @click="toggleFullscreen"
              :icon="FullScreen"
            >
              全屏
            </el-button>
          </div>

          <!-- 播放速度控制 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                播放速度: {{ playbackRate }}x
              </label>
              <el-slider
                v-model="playbackRate"
                :min="0.25"
                :max="2"
                :step="0.25"
                @change="changePlaybackRate"
                :marks="{
                  0.25: '0.25x',
                  0.5: '0.5x',
                  1: '1x',
                  1.5: '1.5x',
                  2: '2x'
                }"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                音量: {{ volume }}%
              </label>
              <el-slider
                v-model="volume"
                :min="0"
                :max="100"
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
              <span class="font-medium">{{ formatTime(videoInfo.duration) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">当前时间:</span>
              <span class="font-medium">{{ formatTime(videoInfo.currentTime) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">分辨率:</span>
              <span class="font-medium">{{ videoInfo.width }}x{{ videoInfo.height }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">播放状态:</span>
              <span class="font-medium" :class="isPlaying ? 'text-green-600' : 'text-gray-500'">
                {{ isPlaying ? '播放中' : '已暂停' }}
              </span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">音量状态:</span>
              <span class="font-medium" :class="isMuted ? 'text-red-600' : 'text-blue-600'">
                {{ isMuted ? '已静音' : '正常' }}
              </span>
            </div>
          </div>
          
          <div v-else class="text-gray-500 text-center py-8">
            请选择并加载视频
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
  Mute
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
