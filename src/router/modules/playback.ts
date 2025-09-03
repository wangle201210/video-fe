const Layout = () => import("@/layout/index.vue");

export default {
  path: "/playback",
  name: "Playback",
  component: Layout,
  redirect: "/playback/video-playback",
  meta: {
    icon: "mdi:play-circle-outline",
    title: "录像回放",
    rank: 2
  },
  children: [
    {
      path: "/playback/video-playback",
      name: "VideoPlayback",
      component: () => import("@/views/playback/video-playback/index.vue"),
      meta: {
        title: "录像回放"
      }
    }
  ]
} satisfies RouteConfigsTable;
