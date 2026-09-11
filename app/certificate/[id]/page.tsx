import { eq } from "drizzle-orm";
import { Award, BadgeCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { DownloadPDFButton } from "@/components/certificate/download-pdf-button";
import { Header } from "@/components/Header";
import { db } from "@/db";
import { aiRoadmaps } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";

type Props = { params: Promise<{ id: string }> };

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [roadmap, session] = await Promise.all([
    db.query.aiRoadmaps.findFirst({
      where: eq(aiRoadmaps.id, id),
      with: { milestones: true },
    }),
    auth(),
  ]);

  if (
    !roadmap?.userName
    || !roadmap.milestones.length
    || roadmap.milestones.some((item) => !item.isCompleted)
  ) {
    notFound();
  }

  const completionDate = roadmap.updatedAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#ece9df] dark:bg-[#0a0a0a]">
      <Header contentClassName="max-w-[1120px]">
        <DownloadPDFButton
          targetId="certificate-content"
          fileName="LearnX-Certificate.pdf"
          roadmapTitle={roadmap.title}
          roadmapDuration={roadmap.estimatedDuration}
          viewerKey={session?.user?.email ?? "guest"}
          isAdmin={isAdminEmail(session?.user?.email)}
        />
      </Header>

      <div className="px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-lg shadow-[0_18px_50px_rgba(23,33,27,.18)] sm:rounded-xl sm:shadow-[0_30px_90px_rgba(23,33,27,.18)]">
          <section
            id="certificate-content"
            aria-label={`LearnX certificate awarded to ${roadmap.userName}`}
            className="relative aspect-[1.414/1] w-full overflow-hidden bg-[#fffdf5] p-[1.8cqw] text-[#173326] [container-type:inline-size]"
          >
            <div className="absolute left-0 top-0 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5cqw] border-[#eaffbd]" />
            <div className="absolute bottom-0 right-0 size-[24%] translate-x-1/2 translate-y-1/2 rounded-full border-[3.7cqw] border-[#e7ebe8]" />

            <div className="relative flex h-full flex-col items-center justify-between border-2 border-[#b69b55] p-[1.4cqw] text-center">
              <div className="pointer-events-none absolute inset-[1cqw] border border-[#e4dac1]" />

              <header className="relative z-10 mt-[1%]">
                <div className="mx-auto grid size-[5.7cqw] place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]">
                  <Award className="size-[55%]" aria-hidden="true" />
                </div>
                <p className="mt-[.8cqw] font-serif text-[3.1cqw] font-black leading-none tracking-[-.04em] text-[#173f2c]">
                  Learn<span className="text-[#9a792e]">X</span>
                </p>
                <p className="mt-[.45cqw] text-[1.05cqw] font-bold uppercase tracking-[.38em] text-[#b08936]">
                  Certificate of Achievement
                </p>
              </header>

              <div className="relative z-10 -mt-[1%] max-w-[82%]">
                <p className="font-serif text-[1.55cqw] italic text-[#747e77]">
                  This certificate is proudly presented to
                </p>
                <h1 className="mt-[1.2cqw] break-words py-1 font-serif text-[5.1cqw] font-semibold italic leading-relaxed tracking-tight text-[#173f2c]">
                  {roadmap.userName}
                </h1>
                <div className="mx-auto mt-[1.2cqw] h-px w-2/3 bg-[#b69b55]" />
                <p className="mx-auto mt-[1.4cqw] max-w-3xl font-serif text-[1.5cqw] leading-tight text-[#68756c]">
                  for successfully completing every milestone in the learning path
                </p>
                <h2 className="mt-[.9cqw] py-1 font-serif text-[2.6cqw] font-bold leading-relaxed text-[#173f2c]">
                  {roadmap.title}
                </h2>
                <p className="mx-auto mt-[.65cqw] line-clamp-2 max-w-2xl text-[1.05cqw] leading-tight text-[#89918c]">
                  {roadmap.description}
                </p>
              </div>

              <footer className="relative z-10 mb-[.5%] flex w-[86%] items-end justify-between gap-[1cqw] text-[1.1cqw]">
                <div className="w-[28%] border-t border-[#b9beb9] pt-[.65cqw]">
                  <p className="truncate font-serif font-bold">{completionDate}</p>
                  <p className="mt-[.25cqw] text-[.7em] uppercase tracking-[.12em] text-[#969e98]">
                    Completion date
                  </p>
                </div>

                <div className="flex w-[32%] flex-col items-center">
                  <BadgeCheck className="size-[2.7cqw] text-[#b08936]" aria-hidden="true" />
                  <p className="mt-[.25cqw] font-black uppercase tracking-[.12em]">
                    LearnX Verified
                  </p>
                  <p className="mt-[.2cqw] text-[.65em] text-[#a2a8a4]">
                    ID: {roadmap.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <div className="w-[28%]">
                  <p className="text-[2.15cqw] leading-none text-[#173f2c] [font-family:'Brush_Script_MT','Segoe_Script',cursive]">
                    LearnX
                  </p>
                  <div className="mt-[.3cqw] border-t border-[#b9beb9] pt-[.45cqw]">
                    <p className="font-serif font-bold">LearnX AI Guide</p>
                    <p className="mt-[.2cqw] text-[.7em] uppercase tracking-[.12em] text-[#969e98]">
                      Official signature
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
