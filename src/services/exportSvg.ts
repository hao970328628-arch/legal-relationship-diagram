import { projectFileBaseName } from "./importExportJson";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function serializeSvg(svg: SVGSVGElement, width: number, height: number) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-editor-only='true']").forEach((element) => {
    element.remove();
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(
    clone,
  )}`;
}

export function exportSvgFile(svg: SVGSVGElement, title: string, width: number, height: number) {
  const svgText = serializeSvg(svg, width, height);
  downloadBlob(
    new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
    `${projectFileBaseName(title)}.svg`,
  );
}
