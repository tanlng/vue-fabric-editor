import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/DragUploadLayer/index.vue'),
  },
];

export default routes;
