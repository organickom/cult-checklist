import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Adjust base if deploying to GitHub Pages project site: '/<REPO_NAME>/'
export default defineConfig({
  plugins: [react()],
  base: '', // set to '/cult-checklist/' (your repo name) if using project pages
})
