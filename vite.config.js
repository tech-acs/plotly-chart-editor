import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'resources/js/plotly-chart-editor.js',
            name: 'PlotlyChartEditor',
            fileName: 'plotly-chart-editor',
            formats: ['es', 'umd'],
        },
        outDir: 'dist',
        rollupOptions: {
            // Plotly.js is a peer dependency — do not bundle it
            external: ['plotly.js', 'plotly.js-dist'],
        },
    },
})
