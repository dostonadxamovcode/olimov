import daisyui from 'daisyui'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    // Keep DaisyUI's reset and theme background rules out of the existing app.
    base: false,
    // A single palette provides fully styled components without theme switching.
    themes: ['dark'],
    logs: false,
  },
}
