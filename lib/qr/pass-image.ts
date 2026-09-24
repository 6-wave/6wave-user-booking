import { QR_INK, QR_QUIET_ZONE, createQrMatrix } from "./matrix";

export interface PassImageInput {
  token: string;
  displayName: string;
  reference: string;
  eventName: string;
  date: string;
  location: string;
}

const WIDTH = 1080;
const HEIGHT = 1500;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  startSize: number,
  weight: number,
  family = FONT,
) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  ctx.fillText(text, x, y);
}

/**
 * Renders a shareable PNG of the participant's QR pass. It deliberately leaves
 * out payment status: that can change, and only the backend is authoritative.
 */
export async function createPassImage(input: PassImageInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Header band
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, 300);
  gradient.addColorStop(0, "#0a3b48");
  gradient.addColorStop(1, "#1a9aa0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, 300);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd23a";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("EVENT PASS", WIDTH / 2, 110);
  ctx.fillStyle = "#ffffff";
  fitText(ctx, input.eventName, WIDTH / 2, 200, WIDTH - 140, 76, 700);

  // QR code
  const matrix = createQrMatrix(input.token);
  const totalModules = matrix.size + QR_QUIET_ZONE * 2;
  const moduleSize = Math.floor(760 / totalModules);
  const qrSide = moduleSize * totalModules;
  const qrX = Math.round((WIDTH - qrSide) / 2);
  const qrY = 380;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#cfe9e6";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(qrX - 20, qrY - 20, qrSide + 40, qrSide + 40, 28);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = QR_INK;
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (matrix.isDark(row, col)) {
        ctx.fillRect(
          qrX + (col + QR_QUIET_ZONE) * moduleSize,
          qrY + (row + QR_QUIET_ZONE) * moduleSize,
          moduleSize,
          moduleSize,
        );
      }
    }
  }

  // Participant details
  const detailsY = qrY + qrSide + 110;
  ctx.fillStyle = "#0a3b48";
  fitText(ctx, input.displayName, WIDTH / 2, detailsY, WIDTH - 140, 60, 700);

  ctx.fillStyle = "#0f7f8a";
  fitText(
    ctx,
    input.reference,
    WIDTH / 2,
    detailsY + 84,
    WIDTH - 140,
    64,
    700,
    'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  );

  ctx.fillStyle = "#4f7076";
  fitText(ctx, input.date, WIDTH / 2, detailsY + 160, WIDTH - 140, 34, 500);
  fitText(ctx, input.location, WIDTH / 2, detailsY + 208, WIDTH - 140, 34, 500);

  ctx.fillStyle = "#88a3a7";
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText("Show this QR code at the entrance", WIDTH / 2, HEIGHT - 60);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not create the image.")),
      "image/png",
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
