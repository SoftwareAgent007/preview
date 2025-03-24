const getMarkerColor = (value: number) => {
  if (value === 0) return '#808080'; // gray for zero
  return value > 0 ? '#10B981' : '#EF4444';
}; 