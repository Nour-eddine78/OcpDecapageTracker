// Define text and background color utilities for primary, red, yellow, green, blue, etc.
// This is used to handle dynamic classes in the UI
export function getColorClass(color: string, type: 'text' | 'bg', shade: string = '500'): string {
  // Mapping known colors to Tailwind classes
  const colorMap: Record<string, string> = {
    'red': 'red',
    'green': 'green',
    'blue': 'blue',
    'yellow': 'yellow',
    'orange': 'orange',
    'purple': 'purple',
    'gray': 'gray',
    'primary': 'primary',
  };

  const mappedColor = colorMap[color] || 'gray';
  return `${type}-${mappedColor}-${shade}`;
}