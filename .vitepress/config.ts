import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Docker Workshop",
  description: "工作坊實作記錄",
  base: '/docker-workshop/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        items: [
          { text: 'Docker 基本知識', link: '/01-basic' },
          { text: 'Docker Build', link: '/build' },
          { text: 'Multi-stage Build', link: '/multi-stage-build' },
          { text: 'Optimizing Dockerfile', link: '/optimizing-dockerfile' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ganhuaking/docker-workshop' }
    ]
  }
})
