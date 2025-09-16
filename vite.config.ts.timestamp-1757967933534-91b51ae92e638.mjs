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
    "identity"
  ],
  oauth2: {
    client_id: "3d034acf7d4345278203a3136a5fddf1",
    scopes: [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "playlist-read-private",
      "playlist-read-collaborative"
    ]
  },
  host_permissions: [
    "https://api.spotify.com/*",
    "https://sdk.scdn.co/*"
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'unsafe-inline' https://sdk.scdn.co; object-src 'self'"
  },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxBbm5pZVxcXFxWZWxhLTAyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcQW5uaWVcXFxcVmVsYS0wMlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9EZXNrdG9wL0FubmllL1ZlbGEtMDIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCB7IGNyeCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbidcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL21hbmlmZXN0Lmpzb24nXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBjcngoeyBtYW5pZmVzdCB9KV0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAzMDAwLFxyXG4gICAgaG9zdDogJzEyNy4wLjAuMSdcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJylcclxuICAgIH1cclxuICB9XHJcbn0pIiwgIntcclxuICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcclxuICBcIm5hbWVcIjogXCJWZWxhXCIsXHJcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjBcIixcclxuICBcImRlc2NyaXB0aW9uXCI6IFwiVHJhbnNmb3JtIGV2ZXJ5IG5ldyB0YWIgaW50byBhIHByb2R1Y3Rpdml0eSBvcHBvcnR1bml0eSB3aXRoIGZvY3VzIHNlc3Npb25zLCB0YXNrIG1hbmFnZW1lbnQsIGFuZCBwcm9ncmVzcyB0cmFja2luZy5cIixcclxuICBcInBlcm1pc3Npb25zXCI6IFtcclxuICAgIFwic3RvcmFnZVwiLFxyXG4gICAgXCJhbGFybXNcIixcclxuICAgIFwibm90aWZpY2F0aW9uc1wiLFxyXG4gICAgXCJpZGVudGl0eVwiXHJcbiAgXSxcclxuICBcIm9hdXRoMlwiOiB7XHJcbiAgICBcImNsaWVudF9pZFwiOiBcIjNkMDM0YWNmN2Q0MzQ1Mjc4MjAzYTMxMzZhNWZkZGYxXCIsXHJcbiAgICBcInNjb3Blc1wiOiBbXHJcbiAgICAgIFwic3RyZWFtaW5nXCIsXHJcbiAgICAgIFwidXNlci1yZWFkLWVtYWlsXCIsXHJcbiAgICAgIFwidXNlci1yZWFkLXByaXZhdGVcIixcclxuICAgICAgXCJ1c2VyLXJlYWQtcGxheWJhY2stc3RhdGVcIixcclxuICAgICAgXCJ1c2VyLW1vZGlmeS1wbGF5YmFjay1zdGF0ZVwiLFxyXG4gICAgICBcInBsYXlsaXN0LXJlYWQtcHJpdmF0ZVwiLFxyXG4gICAgICBcInBsYXlsaXN0LXJlYWQtY29sbGFib3JhdGl2ZVwiXHJcbiAgICBdXHJcbiAgfSxcclxuICBcImhvc3RfcGVybWlzc2lvbnNcIjogW1xyXG4gICAgXCJodHRwczovL2FwaS5zcG90aWZ5LmNvbS8qXCIsXHJcbiAgICBcImh0dHBzOi8vc2RrLnNjZG4uY28vKlwiXHJcbiAgXSxcclxuICBcImNvbnRlbnRfc2VjdXJpdHlfcG9saWN5XCI6IHtcclxuICAgIFwiZXh0ZW5zaW9uX3BhZ2VzXCI6IFwic2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnIGh0dHBzOi8vc2RrLnNjZG4uY287IG9iamVjdC1zcmMgJ3NlbGYnXCJcclxuICB9LFxyXG4gIFwiY2hyb21lX3VybF9vdmVycmlkZXNcIjoge1xyXG4gICAgXCJuZXd0YWJcIjogXCJpbmRleC5odG1sXCJcclxuICB9LFxyXG4gIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICBcInNlcnZpY2Vfd29ya2VyXCI6IFwic3JjL2JhY2tncm91bmQvYmFja2dyb3VuZC50c1wiXHJcbiAgfSxcclxuICBcImFjdGlvblwiOiB7XHJcbiAgICBcImRlZmF1bHRfcG9wdXBcIjogXCJwb3B1cC5odG1sXCIsXHJcbiAgICBcImRlZmF1bHRfdGl0bGVcIjogXCJWZWxhXCJcclxuICB9LFxyXG4gIFwiaWNvbnNcIjoge1xyXG4gICAgXCIxNlwiOiBcImljb25zL2ljb24tMTYucG5nXCIsXHJcbiAgICBcIjMyXCI6IFwiaWNvbnMvaWNvbi0zMi5wbmdcIixcclxuICAgIFwiNDhcIjogXCJpY29ucy9pY29uLTQ4LnBuZ1wiLFxyXG4gICAgXCIxMjhcIjogXCJpY29ucy9pY29uLTEyOC5wbmdcIlxyXG4gIH1cclxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVMsU0FBUyxvQkFBb0I7QUFDcFUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsV0FBVztBQUNwQixTQUFTLGVBQWU7OztBQ0h4QjtBQUFBLEVBQ0Usa0JBQW9CO0FBQUEsRUFDcEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsYUFBZTtBQUFBLEVBQ2YsYUFBZTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFVO0FBQUEsSUFDUixXQUFhO0FBQUEsSUFDYixRQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxrQkFBb0I7QUFBQSxJQUNsQjtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSx5QkFBMkI7QUFBQSxJQUN6QixpQkFBbUI7QUFBQSxFQUNyQjtBQUFBLEVBQ0Esc0JBQXdCO0FBQUEsSUFDdEIsUUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFlBQWM7QUFBQSxJQUNaLGdCQUFrQjtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxRQUFVO0FBQUEsSUFDUixlQUFpQjtBQUFBLElBQ2pCLGVBQWlCO0FBQUEsRUFDbkI7QUFBQSxFQUNBLE9BQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNUO0FBQ0Y7OztBRDlDQSxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSwyQkFBUyxDQUFDLENBQUM7QUFBQSxFQUNwQyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
