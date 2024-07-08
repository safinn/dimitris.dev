// vite.config.ts
import { vitePlugin as remix } from "file:///Users/dimitris/Documents/dev/dimitris.dev/node_modules/.pnpm/@remix-run+dev@2.10.2_@remix-run+react@2.10.2_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_yplh6wiirpihb7yb4haxdjcseu/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///Users/dimitris/Documents/dev/dimitris.dev/node_modules/.pnpm/vite@5.3.3_@types+node@20.3.1/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Users/dimitris/Documents/dev/dimitris.dev/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.3_vite@5.3.3_@types+node@20.3.1_/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_fogOfWar: true,
        unstable_singleFetch: true
      }
    }),
    tsconfigPaths()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZGltaXRyaXMvRG9jdW1lbnRzL2Rldi9kaW1pdHJpcy5kZXZcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9kaW1pdHJpcy9Eb2N1bWVudHMvZGV2L2RpbWl0cmlzLmRldi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZGltaXRyaXMvRG9jdW1lbnRzL2Rldi9kaW1pdHJpcy5kZXYvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSAnQHJlbWl4LXJ1bi9kZXYnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlbWl4KHtcbiAgICAgIGZ1dHVyZToge1xuICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgdjNfcmVsYXRpdmVTcGxhdFBhdGg6IHRydWUsXG4gICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXG4gICAgICAgIHVuc3RhYmxlX2ZvZ09mV2FyOiB0cnVlLFxuICAgICAgICB1bnN0YWJsZV9zaW5nbGVGZXRjaDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgdHNjb25maWdQYXRocygpLFxuICBdLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1QsU0FBUyxjQUFjLGFBQWE7QUFDcFYsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFFMUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ04sbUJBQW1CO0FBQUEsUUFDbkIsc0JBQXNCO0FBQUEsUUFDdEIscUJBQXFCO0FBQUEsUUFDckIsbUJBQW1CO0FBQUEsUUFDbkIsc0JBQXNCO0FBQUEsTUFDeEI7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELGNBQWM7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
