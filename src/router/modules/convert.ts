const Layout = () => import("@/layout/index.vue");

export default {
  path: "/convert",
  name: "Convert",
  component: Layout,
  redirect: "/convert/stream-convert",
  meta: {
    icon: "mdi:swap-horizontal",
    title: "转换流",
    rank: 8
  },
  children: [
    {
      path: "/convert/stream-convert",
      name: "StreamConvert",
      component: () => import("@/views/convert/stream-convert/index.vue"),
      meta: {
        title: "转换流"
      }
    }
  ]
} satisfies RouteConfigsTable;
