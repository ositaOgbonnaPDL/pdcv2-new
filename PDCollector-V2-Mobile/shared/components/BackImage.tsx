import React from 'react';
import ChevronLeft from '../../assets/svg/sf/chevron.backward.svg';

export default function BackImage({
  color,
  size = 20,
  width = size,
  height = size,
}: Partial<Record<'size' | 'width' | 'height', number>> & {
  color: string;
}) {
  return <ChevronLeft width={width} height={height} color={color} />;
}
