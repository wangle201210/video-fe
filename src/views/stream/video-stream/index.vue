<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">HLS视频流播放</h1>
        <p class="text-gray-600">基于 HLS.js 的专业HLS视频流播放器</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- 视频播放器区域 -->
        <div class="xl:col-span-3">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <!-- 流源选择 -->
            <div class="mb-4 flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">
                  HLS流地址:
                </label>
                <el-select
                  v-model="selectedStream"
                  placeholder="选择HLS视频流"
                  class="w-80"
                  @change="changeStream"
                >
                  <el-option
                    v-for="stream in hlsStreams"
                    :key="stream.value"
                    :label="stream.label"
                    :value="stream.value"
                  />
                </el-select>
              </div>
              <el-button
                type="primary"
                :icon="VideoPlay"
                :disabled="!selectedStream"
                @click="playStream"
              >
                播放
              </el-button>
              <el-button
                :icon="VideoPause"
                :disabled="!isPlaying"
                @click="pauseStream"
              >
                暂停
              </el-button>
              <el-button
                :icon="RefreshRight"
                :disabled="!selectedStream"
                @click="refreshStream"
              >
                刷新
              </el-button>
            </div>

            <!-- HLS.js 播放器 -->
            <div class="relative bg-black rounded-lg overflow-hidden">
              <video
                ref="videoElement"
                class="w-full h-auto"
                controls
                preload="none"
                style="width: 100%; height: 500px; object-fit: contain"
              >
                您的浏览器不支持 HTML5 视频播放。
              </video>

              <!-- 加载状态 -->
              <div
                v-if="isLoading"
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              >
                <div class="text-white text-center">
                  <el-icon class="animate-spin text-4xl mb-2">
                    <Loading />
                  </el-icon>
                  <p>{{ loadingMessage }}</p>
                </div>
              </div>
            </div>

            <!-- 播放状态信息 -->
            <div class="mt-4 bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">状态:</span>
                  <el-tag :type="isPlaying ? 'success' : 'info'" size="small">
                    {{ isPlaying ? "播放中" : "已暂停" }}
                  </el-tag>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">连接:</span>
                  <el-tag
                    :type="
                      connectionStatus === 'connected' ? 'success' : 'danger'
                    "
                    size="small"
                  >
                    {{ connectionStatus === "connected" ? "已连接" : "未连接" }}
                  </el-tag>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">格式:</span>
                  <span class="text-gray-800">HLS (m3u8)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">质量:</span>
                  <span class="text-gray-800">{{ currentLevel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 流信息面板 -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <el-icon class="text-blue-500">
                <InfoFilled />
              </el-icon>
              流信息
            </h3>

            <div class="space-y-4">
              <!-- 当前流地址 -->
              <div>
                <span class="text-sm text-gray-600 block mb-1">当前流:</span>
                <p
                  class="text-xs text-gray-800 bg-gray-100 p-2 rounded break-all"
                >
                  {{ selectedStream || "未选择" }}
                </p>
              </div>

              <!-- 播放器信息 -->
              <div v-if="hlsInstance">
                <span class="text-sm text-gray-600 block mb-2"
                  >播放器信息:</span
                >
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-600">技术:</span>
                    <span class="text-gray-800">HLS.js</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">版本:</span>
                    <span class="text-gray-800">{{ hlsVersion }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">时长:</span>
                    <span class="text-gray-800">{{ playerInfo.duration }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">当前时间:</span>
                    <span class="text-gray-800">{{
                      playerInfo.currentTime
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">缓冲长度:</span>
                    <span class="text-gray-800">{{ bufferInfo }}</span>
                  </div>
                </div>
              </div>

              <!-- 错误信息 -->
              <div v-if="errorMessage">
                <span class="text-sm text-red-600 block mb-1">错误信息:</span>
                <p class="text-xs text-red-800 bg-red-50 p-2 rounded">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- HLS流列表 -->
          <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <el-icon class="text-green-500">
                <List />
              </el-icon>
              HLS测试流
            </h3>

            <div class="space-y-2">
              <div
                v-for="stream in hlsStreams"
                :key="stream.value"
                class="p-3 border rounded-lg cursor-pointer transition-colors"
                :class="{
                  'border-blue-500 bg-blue-50': selectedStream === stream.value,
                  'border-gray-200 hover:border-gray-300':
                    selectedStream !== stream.value
                }"
                @click="selectStream(stream.value)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ stream.label }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ stream.description }}
                    </p>
                  </div>
                  <el-tag type="success" size="small">在线</el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 质量级别控制 -->
          <div
            class="bg-white rounded-lg shadow-sm p-6 mt-6"
            v-if="levels.length > 0"
          >
            <h3
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <el-icon class="text-purple-500">
                <Setting />
              </el-icon>
              质量控制
            </h3>

            <div class="space-y-2">
              <el-radio-group
                v-model="selectedLevelIndex"
                @change="changeLevel"
              >
                <div class="space-y-2">
                  <el-radio :value="-1" class="w-full">
                    <span class="text-sm">自动 (推荐)</span>
                  </el-radio>
                  <el-radio
                    v-for="(level, index) in levels"
                    :key="index"
                    :value="index"
                    class="w-full"
                  >
                    <span class="text-sm">
                      {{ level.height }}p ({{
                        Math.round(level.bitrate / 1000)
                      }}kbps)
                    </span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import Hls from "hls.js";
import {
  VideoPlay,
  VideoPause,
  RefreshRight,
  Loading,
  InfoFilled,
  List,
  Setting
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

defineOptions({
  name: "VideoStream"
});

// 响应式数据
const videoElement = ref<HTMLVideoElement>();
const hlsInstance = ref<Hls | null>(null);
const selectedStream = ref("");
const isPlaying = ref(false);
const isLoading = ref(false);
const connectionStatus = ref("disconnected");
const loadingMessage = ref("正在加载视频流...");
const errorMessage = ref("");
const hlsVersion = ref("");
const currentLevel = ref("自动");
const bufferInfo = ref("0s");
const levels = ref<any[]>([]);
const selectedLevelIndex = ref(-1);

// HLS测试流列表
const hlsStreams = ref([
  {
    label: "Apple HLS 测试流",
    value:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    description: "Apple官方HLS测试流"
  },
  {
    label: "Mux HLS 测试流",
    value: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Mux提供的HLS测试流"
  },
  {
    label: "Big Buck Bunny HLS",
    value:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    description: "经典测试视频HLS流"
  }
]);

// 播放器信息
const playerInfo = ref({
  duration: "",
  currentTime: ""
});

// 检查HLS.js支持
const checkHlsSupport = (): boolean => {
  if (Hls.isSupported()) {
    console.log("HLS.js 支持");
    return true;
  } else if (videoElement.value?.canPlayType("application/vnd.apple.mpegurl")) {
    console.log("原生HLS支持");
    return true;
  } else {
    console.error("HLS不支持");
    ElMessage.error("您的浏览器不支持HLS播放");
    return false;
  }
};

// 初始化HLS播放器
const initHlsPlayer = async () => {
  if (!videoElement.value) return;

  try {
    await nextTick();

    // 销毁已存在的HLS实例
    if (hlsInstance.value) {
      hlsInstance.value.destroy();
      hlsInstance.value = null;
    }

    // 检查HLS支持
    if (!checkHlsSupport()) return;

    // 创建HLS实例
    if (Hls.isSupported()) {
      hlsInstance.value = new Hls({
        // 流式播放优化配置
        enableWorker: true, // 启用Web Worker
        lowLatencyMode: true, // 低延迟模式
        backBufferLength: 90, // 后缓冲长度
        maxBufferLength: 10, // 最大缓冲长度（秒）- 减少缓冲实现快速播放
        maxMaxBufferLength: 20, // 最大缓冲长度上限
        maxBufferSize: 60 * 1000 * 1000, // 最大缓冲大小（60MB）
        maxBufferHole: 0.5, // 最大缓冲洞
        highBufferWatchdogPeriod: 2, // 高缓冲监控周期
        nudgeOffset: 0.1, // 微调偏移
        nudgeMaxRetry: 3, // 微调最大重试次数
        maxFragLookUpTolerance: 0.25, // 最大片段查找容差
        liveSyncDurationCount: 3, // 直播同步持续时间计数
        liveMaxLatencyDurationCount: 10, // 直播最大延迟持续时间计数
        liveDurationInfinity: false, // 直播持续时间无限
        liveBackBufferLength: 0, // 直播后缓冲长度
        maxLiveSyncPlaybackRate: 1, // 最大直播同步播放速率
        // 片段加载优化
        fragLoadingTimeOut: 20000, // 片段加载超时
        fragLoadingMaxRetry: 4, // 片段加载最大重试次数
        fragLoadingRetryDelay: 1000, // 片段加载重试延迟
        fragLoadingMaxRetryTimeout: 64000, // 片段加载最大重试超时
        // 播放列表加载优化
        manifestLoadingTimeOut: 10000, // 清单加载超时
        manifestLoadingMaxRetry: 1, // 清单加载最大重试次数
        manifestLoadingRetryDelay: 1000, // 清单加载重试延迟
        manifestLoadingMaxRetryTimeout: 64000, // 清单加载最大重试超时
        // 自适应比特率
        abrEwmaFastLive: 3.0, // ABR EWMA快速直播
        abrEwmaSlowLive: 9.0, // ABR EWMA慢速直播
        abrEwmaFastVoD: 3.0, // ABR EWMA快速点播
        abrEwmaSlowVoD: 9.0, // ABR EWMA慢速点播
        abrEwmaDefaultEstimate: 5e5, // ABR EWMA默认估计
        abrBandWidthFactor: 0.95, // ABR带宽因子
        abrBandWidthUpFactor: 0.7, // ABR带宽上升因子
        abrMaxWithRealBitrate: false, // ABR最大真实比特率
        maxStarvationDelay: 4, // 最大饥饿延迟
        maxLoadingDelay: 4, // 最大加载延迟
        minAutoBitrate: 0, // 最小自动比特率
        // 错误恢复
        emeEnabled: true, // 启用EME
        requestMediaKeySystemAccessFunc: undefined // 请求媒体密钥系统访问函数
      });

      hlsVersion.value = Hls.version;
      setupHlsEvents();
      hlsInstance.value.attachMedia(videoElement.value);
    }

    // 设置视频元素事件
    setupVideoEvents();

    console.log("HLS.js播放器初始化成功");
  } catch (error) {
    console.error("初始化HLS播放器失败:", error);
    ElMessage.error("初始化播放器失败");
  }
};

// 设置HLS事件监听
const setupHlsEvents = () => {
  if (!hlsInstance.value) return;

  // 清单解析完成
  hlsInstance.value.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
    console.log("HLS清单解析完成", data);
    levels.value = data.levels;
    isLoading.value = false;
    connectionStatus.value = "connected";

    // 自动开始播放
    if (videoElement.value) {
      videoElement.value.play().catch(error => {
         console.log("自动播放被阻止:", error);
       });
    }
  });

  // 级别切换
  hlsInstance.value.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
    console.log("质量级别切换:", data);
    const level = levels.value[data.level];
    if (level) {
      currentLevel.value = `${level.height}p (${Math.round(
        level.bitrate / 1000
      )}kbps)`;
    }
  });

  // 片段加载开始
  hlsInstance.value.on(Hls.Events.FRAG_LOADING, (event, data) => {
    console.log("片段加载开始:", data.frag.url);
  });

  // 片段加载完成
  hlsInstance.value.on(Hls.Events.FRAG_LOADED, (event, data) => {
    console.log("片段加载完成:", data.frag.url);
    updateBufferInfo();
  });

  // 错误处理
  hlsInstance.value.on(Hls.Events.ERROR, (event, data) => {
    console.error("HLS错误:", data);

    let message = "播放错误";
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          message = "网络错误，请检查网络连接";
          console.log("尝试恢复网络错误");
          hlsInstance.value?.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          message = "媒体错误，尝试恢复";
          console.log("尝试恢复媒体错误");
          hlsInstance.value?.recoverMediaError();
          break;
        default:
          message = "致命错误，无法恢复";
          hlsInstance.value?.destroy();
          connectionStatus.value = "disconnected";
          break;
      }
    } else {
      message = `非致命错误: ${data.details}`;
    }

    errorMessage.value = message;
    ElMessage.error(message);
    isLoading.value = false;
  });

  // 缓冲区更新
  hlsInstance.value.on(Hls.Events.BUFFER_APPENDED, () => {
    updateBufferInfo();
  });
};

// 设置视频元素事件
const setupVideoEvents = () => {
  if (!videoElement.value) return;

  videoElement.value.addEventListener("loadstart", () => {
    isLoading.value = true;
    loadingMessage.value = "开始加载视频流...";
    errorMessage.value = "";
    console.log("开始加载视频流");
  });

  videoElement.value.addEventListener("loadedmetadata", () => {
    console.log("视频元数据加载完成");
    updatePlayerInfo();
  });

  videoElement.value.addEventListener("canplay", () => {
    isLoading.value = false;
    console.log("视频可以播放");
  });

  videoElement.value.addEventListener("play", () => {
    isPlaying.value = true;
    isLoading.value = false;
    console.log("视频开始播放");
  });

  videoElement.value.addEventListener("pause", () => {
    isPlaying.value = false;
    console.log("视频暂停");
  });

  videoElement.value.addEventListener("waiting", () => {
    isLoading.value = true;
    loadingMessage.value = "视频缓冲中...";
    console.log("视频缓冲中");
  });

  videoElement.value.addEventListener("playing", () => {
    isLoading.value = false;
    console.log("视频正在播放");
  });

  videoElement.value.addEventListener("timeupdate", () => {
    updatePlayerInfo();
    updateBufferInfo();
  });

  videoElement.value.addEventListener("error", error => {
     console.error("视频元素错误:", error);
     const message = "视频播放失败";
     errorMessage.value = message;
     ElMessage.error(message);
     isLoading.value = false;
     connectionStatus.value = "disconnected";
   });
};

// 更新播放器信息
const updatePlayerInfo = () => {
  if (!videoElement.value) return;

  playerInfo.value = {
    duration: formatTime(videoElement.value.duration || 0),
    currentTime: formatTime(videoElement.value.currentTime || 0)
  };
};

// 更新缓冲区信息
const updateBufferInfo = () => {
  if (!videoElement.value) return;

  const buffered = videoElement.value.buffered;
  if (buffered.length > 0) {
    const currentTime = videoElement.value.currentTime;
    const bufferedEnd = buffered.end(buffered.length - 1);
    const bufferLength = Math.max(0, bufferedEnd - currentTime);
    bufferInfo.value = `${bufferLength.toFixed(1)}s`;
  } else {
    bufferInfo.value = "0s";
  }
};

// 格式化时间
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return "--:--";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// 播放流
const playStream = () => {
  if (!selectedStream.value) {
    ElMessage.warning("请先选择一个HLS流");
    return;
  }

  try {
    isLoading.value = true;
    loadingMessage.value = "正在连接HLS流...";
    connectionStatus.value = "connecting";
    errorMessage.value = "";

    console.log("开始播放HLS流:", selectedStream.value);

    if (hlsInstance.value) {
      // 使用HLS.js播放
      hlsInstance.value.loadSource(selectedStream.value);
    } else if (
      videoElement.value?.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // 使用原生HLS播放（Safari）
      videoElement.value.src = selectedStream.value;
      videoElement.value.play().catch(error => {
         console.error("播放失败:", error);
         ElMessage.error("播放失败: " + error.message);
         isLoading.value = false;
         connectionStatus.value = "disconnected";
       });
    }
  } catch (error) {
    console.error("播放HLS流失败:", error);
    ElMessage.error("播放失败");
    isLoading.value = false;
    connectionStatus.value = "disconnected";
  }
};

// 暂停流
const pauseStream = () => {
  if (videoElement.value) {
    videoElement.value.pause();
  }
};

// 刷新流
const refreshStream = () => {
  if (!selectedStream.value) {
    ElMessage.warning("请先选择一个HLS流");
    return;
  }

  console.log("刷新HLS流");
  ElMessage.info("正在刷新视频流");

  // 重新播放当前流
  playStream();
};

// 切换流
const changeStream = () => {
  if (selectedStream.value) {
    playStream();
  }
};

// 选择流
const selectStream = (streamUrl: string) => {
  selectedStream.value = streamUrl;
  console.log("选择HLS流:", streamUrl);
};

// 切换质量级别
const changeLevel = (levelIndex: number) => {
  if (!hlsInstance.value) return;

  console.log("切换质量级别:", levelIndex);
  hlsInstance.value.currentLevel = levelIndex;

  if (levelIndex === -1) {
    currentLevel.value = "自动";
  } else {
    const level = levels.value[levelIndex];
    if (level) {
      currentLevel.value = `${level.height}p (${Math.round(
        level.bitrate / 1000
      )}kbps)`;
    }
  }
};

// 组件挂载
onMounted(async () => {
  await initHlsPlayer();

  // 默认选择第一个流
  if (hlsStreams.value.length > 0) {
    selectedStream.value = hlsStreams.value[0].value;
  }
});

// 组件卸载
onUnmounted(() => {
  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }
});
</script>

<style scoped>
.video-js {
  font-family: inherit;
}

video {
  background-color: #000;
}

.el-radio {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.el-radio__label {
  padding-left: 8px;
}
</style>
