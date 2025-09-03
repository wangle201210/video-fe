const Layout = () => import("@/layout/index.vue");

export default {
  path: "/stream",
  name: "Stream",
  component: Layout,
  redirect: "/stream/push-list",
  meta: {
    icon: "mdi:broadcast",
    title: "推流列表",
    rank: 3
  },
  children: [
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
