import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Default social-share card for Discerning a Call. Fen & Ink: parchment
// surface, EB Garamond display, a single reed accent. No gradients/emoji.
export const alt = "Discerning a Call — a companion for exploring ministry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [serif, italic] = await Promise.all([
    readFile(join(process.cwd(), "og-assets/eb-garamond-500.ttf")),
    readFile(join(process.cwd(), "og-assets/eb-garamond-italic.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F3EC",
          fontFamily: "EB Garamond",
          padding: "70px 84px",
          borderTop: "10px solid #2C3E4A",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 25, fontWeight: 500, letterSpacing: 7, color: "#A98748", textTransform: "uppercase" }}>
            A Wroot Labs Companion
          </div>
          <div style={{ width: 68, height: 3, background: "#C9A86A", marginTop: 30, marginBottom: 34 }} />
          <div style={{ fontSize: 108, fontWeight: 500, color: "#2C3E4A", lineHeight: 1.02 }}>Discerning a Call</div>
          <div style={{ fontSize: 42, fontWeight: 400, fontStyle: "italic", color: "#5B6B76", marginTop: 26, maxWidth: 920, lineHeight: 1.3 }}>
            A companion for anyone sensing a call to ministry — at any stage of life.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 27, fontWeight: 500, color: "#7A7E81" }}>discern.wrootlabs.com</div>
          <div style={{ fontSize: 27, fontWeight: 500, color: "#5B6B76" }}>Paths · Process · Mentors · Seminaries</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "EB Garamond", data: serif, weight: 500, style: "normal" },
        { name: "EB Garamond", data: italic, weight: 400, style: "italic" },
      ],
    },
  );
}
