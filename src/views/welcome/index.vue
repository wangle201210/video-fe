<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import dayjs from "dayjs";

defineOptions({
  name: "Welcome"
});

// 系统信息
const systemInfo = ref({
  currentTime: "",
  localIP: "172.16.17.46",
  startTime: "2025-09-03 18:00:37",
  uptime: "16秒前",
  osVersion: "v5.0.0",
  osName: "darwin",
  cpuArch: "Cpu架构",
  cpuCores: "arm64",
  memoryTotal: "go1.24.5",
  memoryUsed: "内存总量",
  cpuCount: "17",
  processCount: "8"
});

// 图表实例
let memoryChart: echarts.ECharts | null = null;
let cpuChart: echarts.ECharts | null = null;
let ioChart: echarts.ECharts | null = null;

// 内存使用率
const memoryUsage = ref(88);

// 定时器
let timeInterval: NodeJS.Timeout | null = null;
let dataInterval: NodeJS.Timeout | null = null;

// 更新当前时间
const updateCurrentTime = () => {
  systemInfo.value.currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
};

// 初始化内存使用率图表
const initMemoryChart = () => {
  const chartDom = document.getElementById("memoryChart");
  if (!chartDom) return;

  memoryChart = echarts.init(chartDom);
  const option = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "90%",
        min: 0,
        max: 100,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.25, "#7CFFB2"],
              [0.5, "#58D9F9"],
              [0.75, "#FDDD60"],
              [1, "#FF6E76"]
            ]
          }
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "12%",
          width: 20,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto"
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 2
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: "auto",
            width: 5
          }
        },
        axisLabel: {
          color: "#464646",
          fontSize: 20,
          distance: -60,
          rotate: "tangential",
          formatter: function (value: number) {
            if (value === 87.5) {
              return "";
            }
            return value + "";
          }
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 20
        },
        detail: {
          fontSize: 30,
          offsetCenter: [0, "-35%"],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value) + "%";
          },
          color: "inherit"
        },
        data: [
          {
            value: memoryUsage.value,
            name: "已使用内存"
          }
        ]
      }
    ]
  };

  memoryChart.setOption(option);
};

// 初始化CPU使用率图表
const initCpuChart = () => {
  const chartDom = document.getElementById("cpuChart");
  if (!chartDom) return;

  cpuChart = echarts.init(chartDom);

  // 生成模拟数据
  const times = [];
  const values = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    times.push(dayjs(time).format("HH:mm:ss"));
    values.push(Math.random() * 60 + 20);
  }

  const option = {
    grid: {
      top: "10%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: times,
      axisLabel: {
        color: "#666"
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#666",
        formatter: "{value}%"
      }
    },
    series: [
      {
        data: values,
        type: "line",
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(135, 206, 250, 0.8)" },
            { offset: 1, color: "rgba(135, 206, 250, 0.1)" }
          ])
        },
        lineStyle: {
          color: "#87CEEB"
        },
        symbol: "none"
      }
    ]
  };

  cpuChart.setOption(option);
};

// 初始化IO图表
const initIoChart = () => {
  const chartDom = document.getElementById("ioChart");
  if (!chartDom) return;

  ioChart = echarts.init(chartDom);

  // 生成模拟数据
  const times = [];
  const readValues = [];
  const writeValues = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    times.push(dayjs(time).format("HH:mm:ss"));
    readValues.push(Math.random() * 0.8);
    writeValues.push(Math.random() * 0.6);
  }

  const option = {
    grid: {
      top: "10%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    legend: {
      data: ["读取", "写入"],
      top: "5%"
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: times,
      axisLabel: {
        color: "#666"
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#666",
        formatter: "{value}"
      }
    },
    series: [
      {
        name: "读取",
        data: readValues,
        type: "line",
        lineStyle: {
          color: "#5470c6"
        },
        symbol: "none"
      },
      {
        name: "写入",
        data: writeValues,
        type: "line",
        lineStyle: {
          color: "#91cc75"
        },
        symbol: "none"
      }
    ]
  };

  ioChart.setOption(option);
};

// 更新内存使用率
const updateMemoryUsage = () => {
  memoryUsage.value = Math.floor(Math.random() * 20) + 75;
  if (memoryChart) {
    memoryChart.setOption({
      series: [
        {
          data: [
            {
              value: memoryUsage.value,
              name: "已使用内存"
            }
          ]
        }
      ]
    });
  }
};

// 组件挂载
onMounted(() => {
  updateCurrentTime();
  initMemoryChart();
  initCpuChart();
  initIoChart();

  // 定时更新时间
  timeInterval = setInterval(updateCurrentTime, 1000);
  // 定时更新数据
  dataInterval = setInterval(updateMemoryUsage, 3000);
});

// 组件卸载
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  if (memoryChart) {
    memoryChart.dispose();
  }
  if (cpuChart) {
    cpuChart.dispose();
  }
  if (ioChart) {
    ioChart.dispose();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 顶部系统信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- 当前时间 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">当前时间</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.currentTime }}
        </div>
      </div>

      <!-- 本地IP -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">本地IP</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.localIP }}
        </div>
      </div>

      <!-- 启动时间 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">启动时间</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.startTime }}
        </div>
        <div class="text-sm text-gray-400 mt-1">{{ systemInfo.uptime }}</div>
      </div>

      <!-- 系统版本 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">系统版本</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.osVersion }}
        </div>
      </div>
    </div>

    <!-- 系统详细信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">操作系统</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.osName }}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">CPU架构</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.cpuCores }}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">CPU核心数</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.cpuCount }}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500 mb-2">进程数</div>
        <div class="text-lg font-semibold text-gray-800">
          {{ systemInfo.processCount }}
        </div>
      </div>
    </div>

    <!-- 监控图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 内存使用情况 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">内存使用情况</h3>
          <div class="text-sm text-gray-500">内存使用率</div>
        </div>
        <div id="memoryChart" class="h-64" />
      </div>

      <!-- CPU使用情况 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">CPU使用情况</h3>
          <div class="text-sm text-gray-500">CPU使用率</div>
        </div>
        <div id="cpuChart" class="h-64" />
      </div>

      <!-- IO监控 -->
      <div class="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">IO监控</h3>
          <div class="text-sm text-gray-500">磁盘读写</div>
        </div>
        <div id="ioChart" class="h-64" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
