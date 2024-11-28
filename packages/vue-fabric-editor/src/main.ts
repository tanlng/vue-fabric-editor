// 判断是否有存在id如果存在则不创建，直接接管
console.log('创建根节点------------------');
const body = document.body;
const appNode = document.createElement('div');
appNode.setAttribute('id', 'vue-fabric-editor_chrome-plugin');
body.appendChild(appNode);

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ViewUiPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import './styles/index.less';
import VueLazyLoad from 'vue3-lazyload';
// 自定义字体文件
import '@/assets/fonts/font.css';

import { VueMasonryPlugin } from 'vue-masonry';

import i18n from './language/index';

async function bootstrap() {
  const app = createApp(App);
  app.use(VueMasonryPlugin);
  app.use(router);
  app.use(i18n);
  app.use(VueLazyLoad, {});
  app.use(ViewUiPlus);
  await router.isReady();
  app.mount('#vue-fabric-editor_chrome-plugin');
}
bootstrap();
