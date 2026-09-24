import { create } from "qrcode";

export interface QrMatrix {
  /** Modules per side, excluding the quiet zone. */
  size: number;
  isDark: (row: number, col: number) => boolean;
}

/**
 * Builds the QR module grid for an opaque token. The token is encoded as-is:
 * nothing about the participant or their payment is ever added to it.
 */
export function createQrMatrix(token: string): QrMatrix {
  const { modules } = create(token, { errorCorrectionLevel: "Q" });
  return {
    size: modules.size,
    isDark: (row, col) => modules.get(row, col) === 1,
  };
}

/** Consecutive dark modules in one row, merged so the SVG stays small. */
export function darkRuns(
  matrix: QrMatrix,
  row: number,
): { start: number; length: number }[] {
  const runs: { start: number; length: number }[] = [];
  let start = -1;
  for (let col = 0; col <= matrix.size; col++) {
    const dark = col < matrix.size && matrix.isDark(row, col);
    if (dark && start === -1) start = col;
    if (!dark && start !== -1) {
      runs.push({ start, length: col - start });
      start = -1;
    }
  }
  return runs;
}

/** Quiet zone (white margin) around the code, in modules. */
export const QR_QUIET_ZONE = 3;
export const QR_INK = "#050b1a";
