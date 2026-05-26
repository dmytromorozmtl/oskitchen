import { prisma } from "@/lib/prisma";

export async function getReleaseNoteStats() {
  const [total, published, drafts] = await Promise.all([
    prisma.releaseNote.count(),
    prisma.releaseNote.count({ where: { published: true } }),
    prisma.releaseNote.count({ where: { published: false } }),
  ]);
  return { total, published, drafts };
}
