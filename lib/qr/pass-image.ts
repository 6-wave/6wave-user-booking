import { QR_INK, QR_QUIET_ZONE, createQrMatrix } from "./matrix";

export interface PassImageInput {
  token: string;
  displayName: string;
  reference: string;
  eventName: string;
  /** "VIP" or "Regular". */
  ticketLabel: string;
  isVip: boolean;
  date: string;
  location: string;
}

const WIDTH = 1080;
const HEADER_HEIGHT = 300;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

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
 * The height follows the content, so nothing can overlap.
 */
export async function createPassImage(input: PassImageInput): Promise<Blob> {
  const matrix = createQrMatrix(input.token);
  const totalModules = matrix.size + QR_QUIET_ZONE * 2;
  const moduleSize = Math.floor(760 / totalModules);
  const qrSide = moduleSize * totalModules;
  const qrX = Math.round((WIDTH - qrSide) / 2);
  const qrY = HEADER_HEIGHT + 80;

  // Vertical layout, top to bottom, each block with its own room.
  const nameY = qrY + qrSide + 120;
  const referenceY = nameY + 88;
  const pillY = referenceY + 46;
  const pillH = 64;
  const dateY = pillY + pillH + 78;
  const venueY = dateY + 54;
  const footerY = venueY + 100;
  const height = footerY + 56;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, height);

  // Header band
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEADER_HEIGHT);
  gradient.addColorStop(0, "#0d0a0a");
  gradient.addColorStop(1, "#a30f14");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEADER_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f1e6cf";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("EVENT PASS", WIDTH / 2, 110);
  ctx.fillStyle = "#ffffff";
  fitText(ctx, input.eventName, WIDTH / 2, 200, WIDTH - 140, 76, 700);

  // QR code on white, with a soft frame
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ead9d5";
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

  // Participant
  ctx.fillStyle = "#0d0a0a";
  fitText(ctx, input.displayName, WIDTH / 2, nameY, WIDTH - 140, 60, 700);
  ctx.fillStyle = "#c4121a";
  fitText(ctx, input.reference, WIDTH / 2, referenceY, WIDTH - 140, 64, 700, MONO);

  // Ticket tier: solid for VIP, outlined for Regular
  const label = `${input.ticketLabel.toUpperCase()} TICKET`;
  ctx.font = `800 34px ${FONT}`;
  const pillW = Math.ceil(ctx.measureText(label).width) + 88;
  const pillX = Math.round((WIDTH - pillW) / 2);
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  if (input.isVip) {
    ctx.fillStyle = "#0d0a0a";
    ctx.fill();
    ctx.fillStyle = "#f1e6cf";
  } else {
    ctx.strokeStyle = "#0d0a0a";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#0d0a0a";
  }
  ctx.fillText(label, WIDTH / 2, pillY + pillH / 2 + 12);

  // When and where
  ctx.fillStyle = "#6b5a58";
  fitText(ctx, input.date, WIDTH / 2, dateY, WIDTH - 140, 36, 600);
  fitText(ctx, input.location, WIDTH / 2, venueY, WIDTH - 140, 36, 600);

  ctx.fillStyle = "#9a8987";
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText("Show this QR code at the entrance", WIDTH / 2, footerY);

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
