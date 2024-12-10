<template>
  <div class="sc-content-drop-area-container" v-show="isShow">
    <!-- 
       @dragend="handleDragEndChrome" @click.native="handleDragEndChrome"
     -->
    <div
      id="sc-content-drop-area"
      class="sc-content-drop-area"
      :class="{
        dragover,
      }"
      :style="styleVm"
      @dragover="dragover = true"
      @dragleave="dragover = false"
      @dragover.prevent
    >
      <div @drop="handleDropLeft" @click="handleDropLeft">
        <div class="sc-content-drop-area-content">
          <div class="icon"><div class="fake-svg"></div></div>
          <div class="title">拖放图片到这里进行编辑</div>
          <div class="description">拖放图片到这里进行编辑</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { getDragConfig, getElementBackgroundImage, getHasSrcTarget } from './drag-config';

const dragMode = 1;
const DIALOG_KEY = 'DragUploadLayer';
export default {
  name: DIALOG_KEY,
  // components: { SelectTree, Splitpanes, Pane },
  data() {
    return {
      isOperated: false,
      selectedFolderTeam: null,
      selectedFolderPrivate: null,
      left: 100,
      top: 100,
      isShow: false,
      isLogin: false,
      dragover: false,

      pageX: 0,
      pageY: 0,
      clientX: 0,
      clientY: 0,

      target: null,
      selectFolderButton: {
        isDragOver: false,
      },
    };
  },
  computed: {
    ...mapState('orange', {
      dialogInfo: (state) => state.dialog[DIALOG_KEY],
    }),
    styleVm() {
      return {
        left: Math.max(0, this.left) + 'px',
        top: Math.max(0, this.top) + 'px',
      };
    },
  },
  methods: {
    /** 锁定异步事件，防止重复触发 */
    async lockAction(func) {
      this.isOperated = true;
      try {
        await func();
      } finally {
        this.isOperated = false;
      }
    },
    /** 1、开始拖拽，判断是否可以拖拽到系统中 */
    async handleDragStart(event) {
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
      this.target = target;

      //6、弹出可拖拽区域
      const dragstartX = event.clientX;
      const dragstartY = event.clientY;
      setTimeout(() => {
        var offsetX = Math.abs(dragstartX - this.clientX);
        var offsetY = Math.abs(dragstartY - this.clientY);
        if (offsetX > 1 || offsetY > 1) {
          // 左右
          if (offsetX > offsetY && dragMode === 1) {
            if (dragstartX <= this.clientX) {
              this.showDropArea({
                orientation: 'Right',
                dragstartX,
                dragstartY,
              });
            } else {
              this.showDropArea({
                orientation: 'Left',
                dragstartX,
                dragstartY,
              });
            }
          } else {
            if (dragstartY >= this.clientY) {
              this.showDropArea({ orientation: 'Top', dragstartX, dragstartY });
            } else if (dragstartY < this.clientY) {
              this.showDropArea({
                orientation: 'Bottom',
                dragstartX,
                dragstartY,
              });
            }
          }
        }
      }, 100);
    },
    showDropArea({ dragstartX, dragstartY, orientation }) {
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

      this.left = left;
      this.top = top;
      this.isShow = true;
    },
    handleMouseMove(event) {
      this.pageX = event.pageX;
      this.pageY = event.pageY;
      this.clientX = event.clientX;
      this.clientY = event.clientY;
    },
    handleDragEndChrome() {
      console.log('handleDragEndChrome');
      this.isShow = false;
      this.target = null;
    },
    async handleDropLeft() {
      console.log('2、handleDropLeft');
      //如果未登录，提示登录
      if (!this.isLogin) {
        this.$openDialog('LoginPluginDlg');
        return;
      }
      const src = getElementBackgroundImage(this.target);
      if (!src) {
        console.error('无法识别的拖拽元素');
        this.isShow = false;
        this.target = null;
        return;
      }

      this.isShow = false;
    },
    async handleDropSelectFolder() {
      console.log('handleDropSelectFolder');
      this.selectFolderButton.isDragOver = false;
      //如果未登录，提示登录
      const src = getElementBackgroundImage(this.target);
      if (!src) {
        console.error('无法识别的拖拽元素');
        this.isShow = false;
        this.target = null;
        return;
      }

      this.isShow = false;
    },
    closeDlg() {
      this.isShow = false;
    },
  },
  created() {
    console.log(this.isShow);
    document.body.addEventListener('dragstart', this.handleDragStart);
    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.addEventListener('dragend', this.handleDragEnd);
  },
  beforeUnmount() {
    document.body.removeEventListener('dragstart', this.handleDragStart);
    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('dragend', this.handleDragEnd);
  },
};
</script>

<style lang="scss" scoped>
.sc-content-drop-area-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
  z-index: 9999999;
}
.sc-content-drop-area {
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
  background: #303034;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;

  display: flex;
  padding: 10px 0;
}

.sc-content-drop-area.sc-show {
  transition: transform 0.1s ease-out;
  transform: translateY(0px);
}

.sc-content-drop-area .sc-content-drop-area-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 180px;
  margin-top: 5px;

  /*border: 1px solid red;*/
}

.sc-content-drop-area .sc-content-drop-area-content .icon {
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

.sc-content-drop-area .sc-content-drop-area-content .icon .fake-svg {
  -webkit-mask: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIxM3B4IiBoZWlnaHQ9IjE1cHgiIHZpZXdCb3g9IjAgMCAxMyAxNSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4gICAgICAgIDx0aXRsZT5pY19kb3dubG9hZF9ub3JtYWw8L3RpdGxlPiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4gICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+ICAgICAgICA8ZyBpZD0i5paw54mI5pys5ouW5ou95qaC5b+1LS0t5ouW5ou96Kem5Y+RIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODE0LjAwMDAwMCwgLTM2Mi4wMDAwMDApIiBmaWxsPSIjMzMzMzMzIj4gICAgICAgICAgICA8ZyBpZD0iR3JvdXAtMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzA5LjAwMDAwMCwgMjg5LjAwMDAwMCkiPiAgICAgICAgICAgICAgICA8ZyBpZD0iR3JvdXAtNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUuMDAwMDAwLCA2MS4wMDAwMDApIj4gICAgICAgICAgICAgICAgICAgIDxnIGlkPSJHcm91cC02IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2Ny40NTAwMDAsIDAuMDAwMDAwKSI+ICAgICAgICAgICAgICAgICAgICAgICAgPGcgaWQ9ImFycm93LWRvd24iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyLjM1MDAwMCwgMTIuMzUwMDAwKSI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJpY19kb3dubG9hZF9ub3JtYWwiIHBvaW50cz0iNi42NSAxMy43NzUgMC40NzUgNy42IDMuOCA3LjYgMy44IDAgOS41IDAgOS41IDcuNiAxMi44MjUgNy42Ij48L3BvbHlnb24+ICAgICAgICAgICAgICAgICAgICAgICAgPC9nPiAgICAgICAgICAgICAgICAgICAgPC9nPiAgICAgICAgICAgICAgICA8L2c+ICAgICAgICAgICAgPC9nPiAgICAgICAgPC9nPiAgICA8L2c+PC9zdmc+)
    no-repeat center center;
  /*background: #333;*/
  height: 44px;
  width: 44px;
  background: #fff;
  transition: all 0.3s ease-in-out;
  animation: icon-jump 1.5s ease 0s infinite normal;
}

.sc-content-drop-area .sc-content-drop-area-content .icon img {
  display: inline-block;
  vertical-align: middle;
}

.sc-content-drop-area .sc-content-drop-area-content .title {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei',
    '微软雅黑', 'Helvetica Neue', Helvetica, Arial, Arial, sans-serif;
  font-size: 16px !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  margin-bottom: 10px !important;
  color: #fff !important;
  transition: all 0.3s ease-in-out;
}

.sc-content-drop-area .sc-content-drop-area-content .description {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei',
    '微软雅黑', 'Helvetica Neue', Helvetica, Arial, Arial, sans-serif;
  font-size: 12px !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  margin-bottom: 0 !important;
  line-height: 1.5 !important;
  color: #fff !important;
  opacity: 0.7;
  transition: all 0.3s ease-in-out;
}

.sc-content-drop-area.dragover .sc-content-drop-area-content .icon {
  background: rgba(255, 255, 255, 0.3);
  /*opacity: 0.9;*/
  /*transform: translateY(0) scale3d(1.05, 1.05, 1);*/
}
</style>
