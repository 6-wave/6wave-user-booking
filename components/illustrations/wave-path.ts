/**
 * A filled wave: `width` wide, crest line at `y`, closed down to `bottom`.
 * `period` should divide `width / 2` so sliding the path by half its own
 * width loops seamlessly.
 */
export function wavePath(
  y: number,
  amplitude: number,
  period: number,
  width: number,
  bottom: number,
): string {
  const half = period / 2;
  let d = `M0 ${y} q${period / 4} ${-amplitude} ${half} 0`;
  for (let x = half; x < width; x += half) d += ` t${half} 0`;
  return `${d} V${bottom} H0 Z`;
}
