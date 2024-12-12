<template>
  <div class="imageeditor-content-drop-area-container" v-show="data.isShow">
    <!-- 
       @dragend="handleDragEndChrome" @click.native="handleDragEndChrome"
     -->
    <Card
      id="imageeditor-content-drop-area"
      class="imageeditor-content-drop-area"
      :class="{
        dragover: data.dragover,
      }"
      :style="styleVm"
      @dragover="data.dragover = true"
      @dragleave="data.dragover = false"
      @dragover.prevent
    >
      <div @drop="handleDropLeft" @click="handleDropLeft">
        <div class="imageeditor-content-drop-area-content">
          <div class="icon">
            <Icon :size="48" type="ios-image" />
          </div>
          <div class="title">拖放图片到这里进行编辑</div>
          <div class="description">拖放图片到这里进行编辑</div>
        </div>
      </div>
    </Card>
  </div>
  <Modal v-if="modal" v-model="modal" fullscreen footer-hide="true">
    <Home :url="data.url"></Home>
  </Modal>
</template>

<script setup lang="ts">
const modal = ref(false);

import { getDragConfig, getElementBackgroundImage, getHasSrcTarget } from './drag-config';
import Home from '@/views/Home/index.vue';

const dragMode = 1;
const data = reactive({
  isOperated: false,
  selectedFolderTeam: null,
  selectedFolderPrivate: null,
  left: 100,
  top: 100,
  isShow: false,
  dragover: false,

  pageX: 0,
  pageY: 0,
  clientX: 0,
  clientY: 0,

  target: null,
  selectFolderButton: {
    isDragOver: false,
  },
  url: '',
});
const styleVm = computed(() => {
  return {
    left: Math.max(0, data.left) + 'px',
    top: Math.max(0, data.top) + 'px',
  };
});
/** 1、开始拖拽，判断是否可以拖拽到系统中 */
async function handleDragStart(event) {
  console.log('handleDragStart chrome');
  if (!event.target || !event.target.nodeName) {
    return;
  }
  // 1、判断拖拽元素是否 a img vedio
  if (!['img', 'a', 'video'].includes(event.target.nodeName.toLowerCase())) {
    return;
  }
  // 2、判断是否开启拖拽
  const { isPage, isDomain } = getDragConfig();
  if (!isPage || !isDomain) {
    return;
  }

  // 3、判断元素属于可编辑元素的子元素
  if (event.target.closest("[contenteditable='true']")) {
    //可编辑元素中的图片不能拖拽
    return;
  }

  var { target } = getHasSrcTarget(event);
  if (!target) {
    console.log('无法拖拽 target为空');
    return;
  }
  var src = getElementBackgroundImage(target);
  if (!src) {
    console.log('无法拖拽 src为空');
    return;
  }
  data.target = target;

  //6、弹出可拖拽区域
  const dragstartX = event.clientX;
  const dragstartY = event.clientY;
  setTimeout(() => {
    var offsetX = Math.abs(dragstartX - data.clientX);
    var offsetY = Math.abs(dragstartY - data.clientY);
    if (offsetX > 1 || offsetY > 1) {
      // 左右
      if (offsetX > offsetY && dragMode === 1) {
        if (dragstartX <= data.clientX) {
          showDropArea({
            orientation: 'Right',
            dragstartX,
            dragstartY,
          });
        } else {
          showDropArea({
            orientation: 'Left',
            dragstartX,
            dragstartY,
          });
        }
      } else {
        if (dragstartY >= data.clientY) {
          showDropArea({ orientation: 'Top', dragstartX, dragstartY });
        } else if (dragstartY < data.clientY) {
          showDropArea({
            orientation: 'Bottom',
            dragstartX,
            dragstartY,
          });
        }
      }
    }
  }, 100);
}
function showDropArea({ dragstartX, dragstartY, orientation }) {
  var left = dragstartX;
  var top = dragstartY;
  if (dragstartX === 0 && dragstartY === 0) return;
  if (orientation === 'Top') {
    left = left - 120;
    top = top - 240 - 80;
    if (top < 0) top = 0;
    if (left + 240 > window.innerWidth) left = window.innerWidth - 240;
  } else if (orientation === 'Bottom') {
    left = left - 120;
    top = top + 80;
    if (top < 0) top = 0;
    if (left + 240 > window.innerWidth) left = window.innerWidth - 240;
  } else if (orientation === 'Right') {
    left = left + 80;
    top = top - 120;
    if (top < 0) top = 0;
    if (left + 240 > window.innerWidth) left = window.innerWidth - 240;
  } else {
    top = top - 120;
    left = left - 80 - 240;
    if (top < 0) top = 0;
    if (left < 0) left = 0;
  }

  data.left = left;
  data.top = top;
  data.isShow = true;
}

function handleMouseMove(event) {
  data.pageX = event.pageX;
  data.pageY = event.pageY;
  data.clientX = event.clientX;
  data.clientY = event.clientY;
}
function handleDragEnd() {
  data.isShow = false;
  data.target = null;
}
async function handleDropLeft() {
  const src = getElementBackgroundImage(data.target);
  if (!src) {
    console.error('无法识别的拖拽元素');
    data.isShow = false;
    data.target = null;
    return;
  }
  data.url = src;
  modal.value = true;
  data.isShow = false;
}

onBeforeMount(() => {
  document.body.addEventListener('dragstart', handleDragStart);
  document.body.addEventListener('mousemove', handleMouseMove);
  document.body.addEventListener('dragend', handleDragEnd);
});
onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    data.url =
      'https://gimg3.baidu.com/search/src=http%3A%2F%2Fpics5.baidu.com%2Ffeed%2Fa5c27d1ed21b0ef4593ff8a7f10140d583cb3e43.jpeg%40f_auto%3Ftoken%3D227dda096faed0630e6270f0a2087842&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=f360,240&n=0&g=0n&q=75&fmt=auto?sec=1734022800&t=f29c7658177d2de63ff764e0bda38c61';
    modal.value = true;
  }
});
onBeforeUnmount(() => {
  document.body.removeEventListener('dragstart', handleDragStart);
  document.body.addEventListener('mousemove', handleMouseMove);
  document.body.removeEventListener('dragend', handleDragEnd);
});
</script>

<style lang="less" scoped>
.imageeditor-content-drop-area-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
  z-index: 9999999;
}
.imageeditor-content-drop-area {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei',
    '微软雅黑', 'Helvetica Neue', Helvetica, Arial, Arial, sans-serif;
  font-weight: 400;
  z-index: 2147483647;
  position: fixed;
  height: 240px;
  width: 480px;
  text-align: center;
  transition: background 0.1s ease-in-out, opacity 0.1s ease-in-out, transform 0.2s ease-in-out,
    border 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
  bottom: 0;
  /*-webkit-perspective: 1000;*/
  transform: translateY(10px);
  /*border: 1px solid rgba(255, 255, 255, 0.07);*/
  /*box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4) 0 8px 24px rgba(65, 69, 100, .15);*/
  box-sizing: border-box;
  opacity: 0.95;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;

  display: flex;
  padding: 10px 0;
}

.imageeditor-content-drop-area.imageeditor-show {
  transition: transform 0.1s ease-out;
  transform: translateY(0px);
}

.imageeditor-content-drop-area .imageeditor-content-drop-area-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 180px;
  margin-top: 5px;

  /*border: 1px solid red;*/
}

.imageeditor-content-drop-area .imageeditor-content-drop-area-content .icon {
  height: 44px;
  width: 44px;
  line-height: 44px;
  text-align: center;
  margin: 0 auto 20px !important;
  /*background-color: rgba(51,51,51,0.05);*/
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
}

.imageeditor-content-drop-area .imageeditor-content-drop-area-content .icon img {
  display: inline-block;
  vertical-align: middle;
}

.imageeditor-content-drop-area .imageeditor-content-drop-area-content .title {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei',
    '微软雅黑', 'Helvetica Neue', Helvetica, Arial, Arial, sans-serif;
  font-size: 16px !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  margin-bottom: 10px !important;
  transition: all 0.3s ease-in-out;
}

.imageeditor-content-drop-area .imageeditor-content-drop-area-content .description {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei',
    '微软雅黑', 'Helvetica Neue', Helvetica, Arial, Arial, sans-serif;
  font-size: 12px !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  margin-bottom: 0 !important;
  line-height: 1.5 !important;
  opacity: 0.7;
  transition: all 0.3s ease-in-out;
}

.imageeditor-content-drop-area.dragover .imageeditor-content-drop-area-content .icon {
  background: rgba(255, 255, 255, 0.3);
  /*opacity: 0.9;*/
  /*transform: translateY(0) scale3d(1.05, 1.05, 1);*/
}
</style>
