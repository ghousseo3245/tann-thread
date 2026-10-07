import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="rounded-full bg-espresso/5 p-6">
        <Compass className="h-10 w-10 text-cognac-dark" aria-hidden="true" />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-cognac">
        404
      </p>
      <h1 className="font-display mt-3 text-4xl text-espresso sm:text-5xl">
        This page wandered off
      </h1>
      <p className="mt-3 max-w-md text-espresso/65">
        The page you are looking for does not exist or was moved. Let us get you back to
        beautiful leather.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            Back to home
          </Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Shop the collection
          </Button>
        </Link>
      </div>
    </div>
  );
}
