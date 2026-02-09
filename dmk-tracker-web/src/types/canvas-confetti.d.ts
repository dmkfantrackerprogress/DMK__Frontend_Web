declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    origin?: { x?: number; y?: number };
    ticks?: number;
    colors?: string[];
    shapes?: ("circle" | "square")[];
    scalar?: number;
    zIndex?: number;
  }

  function confetti(options?: ConfettiOptions): void;

  export default confetti;
}
