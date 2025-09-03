const Layout = () => import("@/layout/index.vue");

export default {
  path: "/proxy",
  name: "Proxy",
  component: Layout,
  redirect: "/proxy/pull-proxy",
  meta: {
    icon: "mdi:download-network",
    title: "代理管理",
    rank: 5
  },
  children: [
    {
      path: "/proxy/pull-proxy",
      name: "PullProxy",
      component: () => import("@/views/proxy/pull-proxy/index.vue"),
      meta: {
        title: "拉流代理"
      }
    },
    {
      path: "/proxy/push-proxy",
      name: "PushProxy",
      component: () => import("@/views/proxy/push-proxy/index.vue"),
      meta: {
        title: "推流代理"
      }
    }
  ]
} satisfies RouteConfigsTable;
