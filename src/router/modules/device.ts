const Layout = () => import("@/layout/index.vue");

export default {
  path: "/device",
  name: "Device",
  component: Layout,
  redirect: "/device/gb-device",
  meta: {
    icon: "mdi:video-input-component",
    title: "国标设备",
    rank: 1
  },
  children: [
    {
      path: "/device/gb-device",
      name: "GbDevice",
      component: () => import("@/views/device/gb-device/index.vue"),
      meta: {
        title: "国标设备"
      }
    }
  ]
} satisfies RouteConfigsTable;
