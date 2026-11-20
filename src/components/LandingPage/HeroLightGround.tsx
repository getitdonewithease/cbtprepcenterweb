import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/ui/cn";

/**
 * Soft bars of brand-orange light drifting over the navy hero ground.
 *
 * One WebGL context. The static CSS ground underneath is always painted, so the
 * frame is never empty: the canvas only fades in once the shader has drawn.
 * Phones (< 768px), reduced motion and browsers without WebGL keep the still ground.
 * Rendering pauses while the hero is off screen or the tab is hidden.
 */

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

const vec3 NAVY = vec3(0.016, 0.031, 0.075);   // hsl(222.2 47.4% 6%)
const vec3 NAVY_LIFT = vec3(0.039, 0.067, 0.149);
const vec3 ORANGE = vec3(0.976, 0.451, 0.086); // hsl(25 95% 53%)

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// one soft upright bar: centre x, half width, breathing phase
float bar(float x, float c, float hw, float phase, float t) {
  float w = hw * (1.0 + 0.08 * sin(t * 0.35 + phase));
  float d = abs(x - c);
  float core = 1.0 - smoothstep(w * 0.4, w * 1.6, d);
  float breath = 0.75 + 0.25 * sin(t * 0.22 + phase * 1.7);
  return core * breath;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time;

  // lean the bars slightly
  float x = uv.x + (uv.y - 0.5) * 0.12;

  float light = 0.0;
  light += bar(x, 0.06, 0.030, 0.0, t) * 0.60;
  light += bar(x, 0.17, 0.050, 1.3, t) * 0.80;
  light += bar(x, 0.38, 0.022, 2.1, t) * 0.50;
  light += bar(x, 0.62, 0.050, 3.4, t) * 0.75;
  light += bar(x, 0.86, 0.035, 4.2, t) * 0.55;

  // one broad pool of light drifting slowly along the bars
  vec2 pool = vec2(0.35 + 0.15 * sin(t * 0.07), 0.6 + 0.15 * cos(t * 0.05));
  float p = exp(-pow(distance(uv * vec2(u_res.x / u_res.y, 1.0), pool * vec2(u_res.x / u_res.y, 1.0)) * 1.6, 2.0));
  light *= 0.45 + 0.9 * p;

  // fade towards the bottom of the frame
  light *= smoothstep(0.0, 0.45, uv.y);

  vec3 ground = mix(NAVY, NAVY_LIFT, uv.y * 0.6 + p * 0.4);
  vec3 col = ground + ORANGE * light * 0.42;

  // still grain
  col += (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const shouldAnimate = (): boolean => {
  if (typeof window === "undefined") return false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = window.matchMedia("(max-width: 767px)").matches;
  return !reducedMotion && !isPhone;
};

interface HeroLightGroundProps {
  className?: string;
}

const HeroLightGround = ({ className }: HeroLightGroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shouldAnimate()) return;

    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "u_res");
    const time = gl.getUniformLocation(program, "u_time");

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    let frame = 0;
    let isVisible = true;
    let hasDrawn = false;
    const start = performance.now();

    const draw = () => {
      frame = 0;
      if (!isVisible || document.hidden) return;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, (performance.now() - start) / 1000 + 20);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!hasDrawn) {
        hasDrawn = true;
        setIsLive(true);
      }
      frame = requestAnimationFrame(draw);
    };

    const resume = () => {
      if (!frame && isVisible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      resume();
    });
    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    resume();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", resume);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {/* Still ground: always painted, and the only ground on phones and under reduced motion */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 60% at 72% 45%, hsl(25 95% 53% / 0.16), transparent 70%), linear-gradient(180deg, hsl(222.2 47.4% 8%), hsl(222.2 47.4% 6%))",
        }}
      />
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-1000",
          isLive ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
};

export default HeroLightGround;
