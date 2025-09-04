const Layout = () => import("@/layout/index.vue");

export default {
  path: "/stream",
  name: "Stream",
  component: Layout,
  redirect: "/stream/video-stream",
  meta: {
    icon: "mdi:video-outline",
    title: "视频流播放",
    rank: 3
  },
  children: [
    {
      path: "/stream/video-stream",
      name: "VideoStream",
      component: () => import("@/views/stream/video-stream/index.vue"),
      meta: {
        title: "视频流播放"
      }
    },
    {
      path: "/stream/push-list",
      name: "PushList",
      component: () => import("@/views/stream/push-list/index.vue"),
      meta: {
        title: "推流列表"
      }
    }
  ]
} satisfies RouteConfigsTable;
