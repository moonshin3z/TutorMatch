/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        uvg: {
          // Acento principal — verde tinta profundo, no el verde UI-kit genérico
          green:        '#1F3D2B',
          'green-dark': '#172E20',
          'green-mid':  '#2D5A3D',
          'green-light':'#EEF4F1',

          // Superficies
          bg:      '#FAFAF7',  // off-white cálido — fondo principal
          surface: '#FFFFFF',  // blanco puro — tarjetas y modales

          // Texto
          text:    '#1A1A1A',  // casi negro, más suave que #000
          muted:   '#6B6B66',  // gris cálido — texto secundario
          subtle:  '#9B9B96',  // gris más claro — hints, placeholders

          // Bordes
          border:  '#E5E5E2',  // borde por defecto — cálido, no frío
          'border-strong': '#C8C8C4',  // para énfasis o separadores
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px' }],
        xs:    ['12px', { lineHeight: '18px' }],
        sm:    ['13px', { lineHeight: '20px' }],
        base:  ['14px', { lineHeight: '22px' }],
        md:    ['15px', { lineHeight: '24px' }],
        lg:    ['17px', { lineHeight: '26px' }],
        xl:    ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '34px' }],
        '3xl': ['30px', { lineHeight: '40px' }],
        '4xl': ['36px', { lineHeight: '46px' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '18':  '72px',
      },
      boxShadow: {
        // Sombras muy contenidas — elevación sin "flotar"
        sm:   '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        // Nada de sombras dramaticas
      },
    }
  },
  plugins: []
}
