export function estimateTextWidth(text: string, fontSize: number): number {
  return Array.from(text).reduce((sum, char) => {
    if (/[\u4e00-\u9fff]/.test(char)) return sum + fontSize;
    if (/[A-Z]/i.test(char)) return sum + fontSize * 0.58;
    if (/\d/.test(char)) return sum + fontSize * 0.56;
    if (/\s/.test(char)) return sum + fontSize * 0.34;
    return sum + fontSize * 0.5;
  }, 0);
}

export function tokenizeLine(line: string): string[] {
  const protectedPattern =
    /\d{4}\.\d{1,2}(?:-\d{1,2})?|\d{4}\.\d{1,2}\s*\/\s*\d{4}\.\d{1,2}|\d+(?:\.\d+)?(?:万元|亿元|吨)|\d+-\d+(?:、\d+-\d+)?|[A-Za-z0-9#]+|./g;
  return line.match(protectedPattern) ?? [];
}

export function wrapManualLine(line: string, maxWidth: number, fontSize: number): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [""];
  if (estimateTextWidth(trimmed, fontSize) <= maxWidth) return [trimmed];

  const tokens = tokenizeLine(trimmed);
  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = current + token;
    if (current && estimateTextWidth(candidate, fontSize) > maxWidth) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current = candidate;
    }
  }

  if (current.trim()) lines.push(current.trim());
  return lines;
}

export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  return text
    .split("\n")
    .flatMap((line) => wrapManualLine(line, maxWidth, fontSize));
}
