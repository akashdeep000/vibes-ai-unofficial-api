/**
 * Aspect-ratio helpers.
 *
 * Key platform behaviour discovered from traces: the video model follows the
 * **dimensions of the start-frame image** (and extend follows the source
 * video's dimensions), not the `aspectRatio` config field. The config field
 * is treated as a hint. This is why a 16:9 start frame produces a 16:9 video
 * even when the config says `9:16`.
 */

import { ASPECT_RATIO } from "../constants.js";
import type { AspectRatio, Dimensions } from "../schemas/common.js";

const RATIOS: ReadonlyArray<{ ratio: AspectRatio; width: number; height: number }> = [
  { ratio: "16:9", width: 16, height: 9 },
  { ratio: "9:16", width: 9, height: 16 },
  { ratio: "1:1", width: 1, height: 1 },
];

/**
 * Maps pixel dimensions to the closest known aspect ratio string.
 *
 * Returns the ratio whose width/height fraction is closest to the input,
 * falling back to `9:16` (the platform default) when nothing matches.
 */
export function dimensionsToAspectRatio(dimensions: Dimensions): AspectRatio {
  if (dimensions.width <= 0 || dimensions.height <= 0) {
    return ASPECT_RATIO["9:16"];
  }
  const input = dimensions.width / dimensions.height;
  let best = RATIOS[1]!; // "9:16" default
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const candidate of RATIOS) {
    const delta = Math.abs(candidate.width / candidate.height - input);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate;
    }
  }
  return best.ratio;
}

/**
 * Derives the aspect ratio that should be sent to the API for a generation.
 *
 * The start-frame image dictates the output ratio, so this prefers the
 * provided dimensions and only falls back to the caller-supplied ratio (or
 * the platform default) when dimensions are unknown.
 */
export function resolveAspectRatio(
  dimensions: Dimensions | undefined,
  requested: AspectRatio | undefined,
): AspectRatio {
  if (dimensions) {
    return dimensionsToAspectRatio(dimensions);
  }
  return requested ?? ASPECT_RATIO["9:16"];
}
