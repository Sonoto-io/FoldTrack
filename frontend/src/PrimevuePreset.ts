import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const PrimevuePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff4e5',
      100: '#ffe0b3',
      200: '#ffcc80',
      300: '#ffb84d',
      400: '#ffa42d',
      500: '#ff9500',
      600: '#e68600',
      700: '#cc7700',
      800: '#995900',
      900: '#663b00',
      950: '#331d00',
    },

    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',

          50: '#252a5c',
          100: '#222654',
          200: '#1f234d',
          300: '#1c2045',
          400: '#191c3e',
          500: '#161937',
          600: '#141738',
          700: '#11142f',
          800: '#0d1026',
          900: '#090b1c',
          950: '#050611',
        },

        primary: {
          color: '#ffa42d',
          contrastColor: '#000000',
          hoverColor: '#ff8c00',
          activeColor: '#e67e00',
        },

        highlight: {
          background: '#ffa42d',
          focusBackground: '#ff8c00',
          color: '#000000',
          focusColor: '#000000',
        },

        mask: {
          background: 'rgba(0,0,0,0.7)',
          color: '#ffffff',
        },

        formField: {
          background: '#1c2045',
          disabledBackground: '#161937',

          filledBackground: '#1c2045',
          filledHoverBackground: '#252a5c',
          filledFocusBackground: '#252a5c',

          borderColor: '#000000',
          hoverBorderColor: '#ffa42d',
          focusBorderColor: '#ffa42d',

          color: '#ffffff',
          disabledColor: '#6b7280',
          placeholderColor: '#aab0d6',

          invalidBorderColor: '#ff5c5c',

          shadow: '4px 4px 0px #000000',

          iconColor: '#aab0d6',
          iconHoverColor: '#ffa42d',
        },

        text: {
          color: '#ffffff',
          hoverColor: '#ffffff',
          mutedColor: '#aab0d6',
          hoverMutedColor: '#ffffff',

          iconColor: '#aab0d6',
          hoverIconColor: '#ffffff',
        },

        content: {
          background: '#1c2045',
          hoverBackground: '#252a5c',
          borderColor: '#000000',
          color: '#ffffff',
          hoverColor: '#ffffff',
          iconColor: '#aab0d6',
        },

        overlay: {
          select: {
            background: '#1c2045',
            borderColor: '#000000',
            color: '#ffffff',
          },

          popover: {
            background: '#1c2045',
            borderColor: '#000000',
            color: '#ffffff',
          },

          modal: {
            background: '#1c2045',
            borderColor: '#000000',
            color: '#ffffff',
          },
        },
      },
    },
  },
})
