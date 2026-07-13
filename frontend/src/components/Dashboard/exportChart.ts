import { toPng } from "html-to-image";

export async function exportChartAsPng(node: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
