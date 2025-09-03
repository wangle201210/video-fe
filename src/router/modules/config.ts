const Layout = () => import("@/layout/index.vue");

export default {
  path: "/config",
  name: "Config",
  component: Layout,
  redirect: "/config/instance-config",
  meta: {
    icon: "mdi:cog-outline",
    title: "配置管理",
    rank: 9
  },
  children: [
    {
      path: "/config/instance-config",
      name: "InstanceConfig",
      component: () => import("@/views/config/instance-config/index.vue"),
      meta: {
        title: "实例配置"
      }
    },
    {
      path: "/config/test-management",
      name: "TestManagement",
      component: () => import("@/views/config/test-management/index.vue"),
      meta: {
        title: "测试管理"
      }
    },
    {
      path: "/config/plugin-management",
      name: "PluginManagement",
      component: () => import("@/views/config/plugin-management/index.vue"),
      meta: {
        title: "插件管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
