import daisyui from 'daisyui'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Tailwind v3 generates plugin CSS on demand. Keep the DaisyUI component
  // classes used by the application available before a JSX file references them.
  // All other official DaisyUI classes are generated automatically when used in
  // the paths listed in `content` above.
  safelist: [
    'btn',
    'card',
    'input',
    'select',
    'badge',
    'alert',
    'modal',
    'modal-box',
    'modal-action',
    'modal-backdrop',
    'modal-toggle',
    'navbar',
    'dropdown',
    'dropdown-content',
    'dropdown-end',
    'drawer',
    'drawer-content',
    'drawer-side',
    'drawer-overlay',
    'drawer-toggle',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    // Keep DaisyUI's reset and theme background rules out of the existing app.
    base: false,
    // A single palette provides fully styled components without theme switching.
    themes: ['dark'],
    // Show the DaisyUI startup banner in `npm run dev`.
    logs: true,
  },
}
