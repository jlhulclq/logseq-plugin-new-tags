import { ComponentProps } from 'react';
import { styled } from 'stitches.config';

export type InputProps = ComponentProps<typeof Input>;

export const Input = styled('input', {
  appearance: 'none',
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  margin: 0,

  fontFamily: '$sans',

  backgroundColor: '$elevation0',
  border: '1px solid $colors$interactiveBorder',
  color: '$slate12',
  caretColor: '$slate12',

  '::placeholder': {
    color: '$slate9',
  },

  '.dark-theme &': {
    color: '$slate12',
    caretColor: '$slate12',
  },

  variants: {
    size: {
      1: { fontSize: '$1' },
      2: { fontSize: '$2' },
      3: { fontSize: '$3' },
    },
  },
});
