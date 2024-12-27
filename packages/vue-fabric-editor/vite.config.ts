/*
 * @Description:
 * @version:
 * @Author: June
 * @Date: 2023-04-24 00:25:39
 * @LastEditors: June
 * @LastEditTime: 2024-10-09 23:57:48
 */
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint'; //导入包
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus';
import autoImports from 'unplugin-auto-import/vite';
import { resolve } from 'path';
import autoprefixer from 'autoprefixer';
import svgLoader from 'vite-svg-loader';

const config = ({ mode }) => {
  const isProd = mode === 'production';
  const envPrefix = 'APP_';
  const { APP_TITLE = '', APP_BASE_PATH } = loadEnv(mode, process.cwd(), envPrefix);
  return {
    base: isProd ? APP_BASE_PATH : '/',
    define: {
      'process.env': {},
    },
    plugins: [
      vue(),
      autoImports({
        imports: ['vue'],
        dts: './typings/auto-imports.d.ts',
        eslintrc: {
          enabled: true, // 一般更新imports启动一次即可
        },
      }),
      vueSetupExtend(),
      // 增加下面的配置项,这样在运行时就能检查eslint规范
      eslintPlugin({
        include: ['src/**/*.js', 'src/**/*.vue', 'src/*.js', 'src/*.vue'],
      }),
      vueJsx({
        // options are passed on to @vue/babel-plugin-jsx
      }),
      createHtmlPlugin({
        minify: isProd,
        inject: {
          data: {
            title: APP_TITLE,
          },
        },
      }),
      svgLoader(),
    ],
    build: {
      target: 'es2015',
      outDir: resolve(__dirname, '../chrome-plugin/win/vue-fabric-editor'),
      assetsDir: 'assets',
      assetsInlineLimit: 8192,
      // sourcemap: !isProd,
      emptyOutDir: true,
      // lib: {
      //   format: 'iife', // 或者 'umd'
      //   entry: resolve(__dirname, 'src/main.ts'),
      //   name: 'imageEditor',
      //   fileName: (format) => `imageEditor.${format}.js`,
      // },
      manifest: true,
      reportCompressedSize: false,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          // manualChunks: {
          //   'vue-lib': ['vue', 'vue-i18n', 'vue-masonry', 'vue-router', '@vueuse/core'],
          //   'kuaitu-lib': ['@kuaitu/core'],
          //   'view-ui-plus-lib': ['view-ui-plus'],
          //   fabric: ['fabric'],
          // },
          manualChunks(id: string) {
            const relativeName = id.toString().split('src/views/')[1];
            // 自定义拆分策略，例如将特定的第三方库拆分为单独的 chunk
            if (id.includes('node_modules/')) {
              ('use strict');
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')
                .filter((x) => x !== '.pnpm')[0];
            }
            if (id.includes('src/styles/')) {
              return 'styles';
            }
            if (id.includes('src/views/')) {
              const name = relativeName.split('/')[0];
              if (relativeName.endsWith('.less') || relativeName.endsWith('.css')) {
                console.log(relativeName); // 打印所有被拆分的模块
                return relativeName.replace('/', '_');
              }
              if (name === 'panels') {
                if (relativeName.endsWith('.less') || relativeName.endsWith('.css')) {
                  console.log(relativeName); // 打印所有被拆分的模块
                  return relativeName.replace('/', '_');
                }
                console.log('panels', relativeName); // 打印所有被拆分的模块
                return 'home';
              }
              console.log('view', relativeName); // 打印所有被拆分的模块
              return name;
            }
          },
        },
      },
      // minify: false, // 禁用代码压缩
    },
    // esbuild: {
    //   loader: 'js',
    //   target: 'es2015',
    // },
    envPrefix,
    resolve: {
      alias: [
        { find: /^@\//, replacement: resolve(__dirname, 'src') + '/' },
        { find: /^~/, replacement: '' },
        { find: /^vue-i18n/, replacement: 'vue-i18n/dist/vue-i18n.cjs.js' },
      ],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.vue', '.json', '.less', '.css'],
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            // 自动添加前缀
            overrideBrowserslist: [
              'Android 4.1',
              'iOS 7.1',
              'Chrome > 31',
              'ff > 31',
              'ie >= 8',
              'last 2 versions', // 所有主流浏览器最近2个版本
            ],
          }),
        ],
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import '${resolve(__dirname, 'src/styles/variable.less')}';`,
        },
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/fontFile': {
          target: 'https://github.com/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fontFile/, ''),
        },
      },
      fs: {
        strict: false,
      },
    },
    preview: {
      port: 5000,
    },
  };
};

export default defineConfig(config);
