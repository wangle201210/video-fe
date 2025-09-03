const Layout = () => import("@/layout/index.vue");

export default {
  path: "/multiscreen",
  name: "Multiscreen",
  component: Layout,
  redirect: "/multiscreen/split-screen",
  meta: {
    icon: "mdi:view-grid",
    title: "分屏播放",
    rank: 4
  },
  children: [
    {
      path: "/multiscreen/split-screen",
      name: "SplitScreen",
      component: () => import("@/views/multiscreen/split-screen/index.vue"),
      meta: {
        title: "分屏播放"
      }
    }
  ]
} satisfies RouteConfigsTable;
