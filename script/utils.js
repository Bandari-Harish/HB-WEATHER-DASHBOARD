// ============================================================
//  utils.js  –  HB Weather Dashboard
//  Helper functions
// ============================================================

export function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;

  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);

  return (b * alpha) / (a - alpha);
}
