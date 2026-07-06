import { projectFileBaseName } from "./importExportJson";
import { downloadBlob, serializeSvg } from "./exportSvg";

export function exportPngFile(
  svg: SVGSVGElement,
  title: string,
  width: number,
  height: number,
) {
  return new Promise<void>((resolve, reject) => {
    const svgText = serializeSvg(svg, width, height);
    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("无法创建 PNG 画布"));
        return;
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          reject(new Error("PNG 生成失败"));
          return;
        }
        downloadBlob(blob, `${projectFileBaseName(title)}.png`);
        resolve();
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG 渲染 PNG 失败"));
    };
    image.src = url;
  });
}
