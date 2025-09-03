<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="bg-white rounded-lg shadow-sm p-8">
      <div class="text-center">
        <div class="mb-4">
          <el-icon size="64" class="text-gray-400">
            <View />
          </el-icon>
        </div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">系统监控</h2>
        <p class="text-gray-500">此页面正在开发中，敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { View } from "@element-plus/icons-vue";

defineOptions({
  name: "SystemMonitor"
});
</script>
