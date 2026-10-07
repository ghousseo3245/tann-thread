import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/ui/product-card";
import { getJournalPost, getProductBySlug } from "@/lib/products";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function JournalArticlePage({ params }: { params: { slug: string } }) {
  const post = getJournalPost(params.slug);
  if (!post) notFound();

  const related = post.relatedSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <article className="container-x py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-espresso/60 hover:text-cognac-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All articles
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cognac">
          The journal
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-espresso/55">
          {formatDate(post.date)} · {post.readMinutes} min read
        </p>
      </div>

      <div className="relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl bg-espresso/5">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover"
          priority
        />
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <p className="font-display text-xl leading-relaxed text-espresso">{post.excerpt}</p>
        <div className="mt-6 space-y-5 leading-relaxed text-espresso/75">
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-5xl">
          <SectionHeader
            eyebrow="Mentioned in this article"
            title="Shop the story"
            align="left"
          />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cognac-dark underline-offset-2 hover:underline"
            >
              Browse the full collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
