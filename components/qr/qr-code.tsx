"use client";

import { useMemo } from "react";
import { m } from "motion/react";
import {
  QR_INK,
  QR_QUIET_ZONE,
  createQrMatrix,
  darkRuns,
} from "@/lib/qr/matrix";

interface QrCodeProps {
  /** Opaque token from the backend. Rendered exactly as received. */
  token: string;
  label: string;
  /** Build the code up row by row on mount. */
  animate?: boolean;
}

/** Crisp, vector QR code with a clear white margin. Fills its container. */
export function QrCode({ token, label, animate = true }: QrCodeProps) {
  const { total, rows } = useMemo(() => {
    const matrix = createQrMatrix(token);
    const rows = Array.from({ length: matrix.size }, (_, row) =>
      darkRuns(matrix, row)
        .map(
          ({ start, length }) =>
            `M${start + QR_QUIET_ZONE} ${row + QR_QUIET_ZONE}h${length}v1h-${length}z`,
        )
        .join(""),
    );
    return { total: matrix.size + QR_QUIET_ZONE * 2, rows };
  }, [token]);

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="block size-full bg-white"
    >
      {rows.map((d, row) =>
        d ? (
          <m.path
            key={row}
            d={d}
            fill={QR_INK}
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 + row * 0.014 }}
          />
        ) : null,
      )}
    </svg>
  );
}
