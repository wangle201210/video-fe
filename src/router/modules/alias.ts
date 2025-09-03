const Layout = () => import("@/layout/index.vue");

export default {
  path: "/alias",
  name: "Alias",
  component: Layout,
  redirect: "/alias/alias-management",
  meta: {
    icon: "mdi:tag-outline",
    title: "别名管理",
    rank: 6
  },
  children: [
    {
      path: "/alias/alias-management",
      name: "AliasManagement",
      component: () => import("@/views/alias/alias-management/index.vue"),
      meta: {
        title: "别名管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
