/**
 * Fog field for the page background.
 * The shape is domain-warped fbm noise, the motion is time through that field,
 * and a hash dither breaks up banding before the color is quantized.
 */

export const AURORA_VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const AURORA_FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uGain;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y),
    mix(
      mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y),
    f.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  float t = uTime;

  vec3 p = vec3(q * 1.35, t * 0.06);
  vec2 warp = vec2(
    fbm(p + vec3(0.0, 0.0, 0.0)),
    fbm(p + vec3(5.2, 1.3, 0.0))
  ) - 0.5;
  float f = fbm(vec3(q * 1.6 + warp * 1.5, t * 0.045 + 3.7));

  vec2 center = vec2(
    fbm(vec3(11.3, 0.0, t * 0.035)) - 0.47,
    fbm(vec3(0.0, 7.1, t * 0.031)) - 0.47
  ) * 0.85;
  float d = length(q - center);
  float mask = smoothstep(0.95, 0.06, d);

  float v = pow(clamp(f * 1.25, 0.0, 1.0), 1.7) * mask;

  float tint = fbm(vec3(q * 0.9 + 19.0, t * 0.024));
  vec3 col = mix(uColA, uColB, smoothstep(0.34, 0.66, tint));

  vec3 rgb = col * v * uGain;

  float dither = (hash(vec3(gl_FragCoord.xy, floor(t * 8.0))) - 0.5) / 255.0;

  gl_FragColor = vec4(rgb + dither, 1.0);
}
`
