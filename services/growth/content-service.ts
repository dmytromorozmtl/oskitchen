import { prisma } from "@/lib/prisma";

export async function contentLibraryStats() {
  const [drafts, published] = await Promise.all([
    prisma.releaseNote.count({ where: { published: false } }),
    prisma.releaseNote.count({ where: { published: true } }),
  ]);
  return { releaseNotesDraft: drafts, releaseNotesPublished: published };
}
