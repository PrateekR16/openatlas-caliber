import { extractText, getDocumentProxy } from "unpdf";

export async function extractResumeText(buf: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(buf);
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}
