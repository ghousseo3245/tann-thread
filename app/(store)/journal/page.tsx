import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { journalPosts } from "@/lib/products";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function JournalPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <SectionHeader
        eyebrow="The journal"
        title="Notes on leather and craft"
        copy="Care guides, workshop stories and honest buying advice from the people who make your pieces."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {journalPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/journal/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-espresso/10 bg-ivory"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-espresso/5">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs uppercase tracking-wide text-espresso/50">
                {formatDate(post.date)} · {post.readMinutes} min read
              </p>
              <h2 className="font-display mt-2 text-2xl leading-snug text-espresso group-hover:text-cognac-dark">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-espresso/65">
                {post.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cognac-dark">
                Read article
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
