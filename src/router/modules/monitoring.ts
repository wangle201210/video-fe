const Layout = () => import("@/layout/index.vue");

export default {
  path: "/monitoring",
  name: "Monitoring",
  component: Layout,
  redirect: "/monitoring/system-monitor",
  meta: {
    icon: "mdi:monitor-dashboard",
    title: "系统观测",
    rank: 7
  },
  children: [
    {
      path: "/monitoring/system-monitor",
      name: "SystemMonitor",
      component: () => import("@/views/monitoring/system-monitor/index.vue"),
      meta: {
        title: "系统监控"
      }
    },
    {
      path: "/monitoring/pressure-test",
      name: "PressureTest",
      component: () => import("@/views/monitoring/pressure-test/index.vue"),
      meta: {
        title: "压力测试"
      }
    }
  ]
} satisfies RouteConfigsTable;
