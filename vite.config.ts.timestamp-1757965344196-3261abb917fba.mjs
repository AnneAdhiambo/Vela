// vite.config.ts
import { defineConfig } from "file:///C:/Users/user/Desktop/Annie/Vela-02/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/user/Desktop/Annie/Vela-02/node_modules/@vitejs/plugin-react/dist/index.js";
import { crx } from "file:///C:/Users/user/Desktop/Annie/Vela-02/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import { resolve } from "path";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "Vela",
  version: "1.0.0",
  description: "Transform every new tab into a productivity opportunity with focus sessions, task management, and progress tracking.",
  permissions: [
    "storage",
    "alarms",
    "notifications",
    "identity",
    "tabs"
  ],
  host_permissions: [
    "https://api.spotify.com/*"
  ],
  chrome_url_overrides: {
    newtab: "index.html"
  },
  background: {
    service_worker: "src/background/background.ts"
  },
  action: {
    default_popup: "popup.html",
    default_title: "Vela"
  },
  icons: {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  oauth2: {
    client_id: "YOUR_SPOTIFY_CLIENT_ID",
    scopes: [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing"
    ]
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\user\\Desktop\\Annie\\Vela-02";
var vite_config_default = defineConfig({
  plugins: [react(), crx({ manifest: manifest_default })],
  server: {
    port: 3e3,
    host: "127.0.0.1"
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxBbm5pZVxcXFxWZWxhLTAyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcQW5uaWVcXFxcVmVsYS0wMlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9EZXNrdG9wL0FubmllL1ZlbGEtMDIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCB7IGNyeCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbidcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL21hbmlmZXN0Lmpzb24nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBjcngoeyBtYW5pZmVzdCB9KV0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAzMDAwLFxyXG4gICAgaG9zdDogJzEyNy4wLjAuMSdcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJylcclxuICAgIH1cclxuICB9XHJcbn0pIiwgIntcclxuICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcclxuICBcIm5hbWVcIjogXCJWZWxhXCIsXHJcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjBcIixcclxuICBcImRlc2NyaXB0aW9uXCI6IFwiVHJhbnNmb3JtIGV2ZXJ5IG5ldyB0YWIgaW50byBhIHByb2R1Y3Rpdml0eSBvcHBvcnR1bml0eSB3aXRoIGZvY3VzIHNlc3Npb25zLCB0YXNrIG1hbmFnZW1lbnQsIGFuZCBwcm9ncmVzcyB0cmFja2luZy5cIixcclxuICBcInBlcm1pc3Npb25zXCI6IFtcclxuICAgIFwic3RvcmFnZVwiLFxyXG4gICAgXCJhbGFybXNcIixcclxuICAgIFwibm90aWZpY2F0aW9uc1wiLFxyXG4gICAgXCJpZGVudGl0eVwiLFxyXG4gICAgXCJ0YWJzXCJcclxuICBdLFxyXG4gIFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXHJcbiAgICBcImh0dHBzOi8vYXBpLnNwb3RpZnkuY29tLypcIlxyXG4gIF0sXHJcbiAgXCJjaHJvbWVfdXJsX292ZXJyaWRlc1wiOiB7XHJcbiAgICBcIm5ld3RhYlwiOiBcImluZGV4Lmh0bWxcIlxyXG4gIH0sXHJcbiAgXCJiYWNrZ3JvdW5kXCI6IHtcclxuICAgIFwic2VydmljZV93b3JrZXJcIjogXCJzcmMvYmFja2dyb3VuZC9iYWNrZ3JvdW5kLnRzXCJcclxuICB9LFxyXG4gIFwiYWN0aW9uXCI6IHtcclxuICAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInBvcHVwLmh0bWxcIixcclxuICAgIFwiZGVmYXVsdF90aXRsZVwiOiBcIlZlbGFcIlxyXG4gIH0sXHJcbiAgXCJpY29uc1wiOiB7XHJcbiAgICBcIjE2XCI6IFwiaWNvbnMvaWNvbi0xNi5wbmdcIixcclxuICAgIFwiMzJcIjogXCJpY29ucy9pY29uLTMyLnBuZ1wiLFxyXG4gICAgXCI0OFwiOiBcImljb25zL2ljb24tNDgucG5nXCIsXHJcbiAgICBcIjEyOFwiOiBcImljb25zL2ljb24tMTI4LnBuZ1wiXHJcbiAgfSxcclxuICBcIm9hdXRoMlwiOiB7XHJcbiAgICBcImNsaWVudF9pZFwiOiBcIllPVVJfU1BPVElGWV9DTElFTlRfSURcIixcclxuICAgIFwic2NvcGVzXCI6IFtcclxuICAgICAgXCJ1c2VyLXJlYWQtcGxheWJhY2stc3RhdGVcIixcclxuICAgICAgXCJ1c2VyLW1vZGlmeS1wbGF5YmFjay1zdGF0ZVwiLFxyXG4gICAgICBcInVzZXItcmVhZC1jdXJyZW50bHktcGxheWluZ1wiXHJcbiAgICBdXHJcbiAgfVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UyxTQUFTLG9CQUFvQjtBQUNwVSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxXQUFXO0FBQ3BCLFNBQVMsZUFBZTs7O0FDSHhCO0FBQUEsRUFDRSxrQkFBb0I7QUFBQSxFQUNwQixNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxhQUFlO0FBQUEsRUFDZixhQUFlO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxrQkFBb0I7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLHNCQUF3QjtBQUFBLElBQ3RCLFFBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQSxZQUFjO0FBQUEsSUFDWixnQkFBa0I7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsUUFBVTtBQUFBLElBQ1IsZUFBaUI7QUFBQSxJQUNqQixlQUFpQjtBQUFBLEVBQ25CO0FBQUEsRUFDQSxPQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsUUFBVTtBQUFBLElBQ1IsV0FBYTtBQUFBLElBQ2IsUUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBRHZDQSxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSwyQkFBUyxDQUFDLENBQUM7QUFBQSxFQUNwQyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
