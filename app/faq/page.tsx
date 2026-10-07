import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    title: "How long does delivery take, and what does it cost?",
    content:
      "We deliver nationwide across Pakistan in 3 to 5 working days. Delivery costs Rs 250 to Rs 500 depending on your city, and it is complimentary on all orders over Rs 15,000. You will receive tracking details as soon as your order ships.",
  },
  {
    title: "Is cash on delivery available?",
    content:
      "Yes. Cash on delivery is available on every order, anywhere in Pakistan. You can also pay by credit or debit card at checkout; card payments are processed securely in test mode while we complete our Stripe integration.",
  },
  {
    title: "What is your exchange and return policy?",
    content:
      "You have 7 days from delivery for an easy exchange, no questions asked. The piece must be unused and in its original condition with tags attached. To start an exchange, contact us with your order number and we will arrange a courier pickup.",
  },
  {
    title: "Do you really repair products for life?",
    content:
      "Yes, and we mean it. Loose stitching, worn edges, tired brass hardware, send the piece back to our Lahore workshop and our craftspeople will repair it free of charge for as long as you own it. You only cover courier charges to us; the return trip is on us.",
  },
  {
    title: "How do I care for full-grain leather?",
    content:
      "Keep it simple: wipe with a dry cloth after use, condition it every 3 to 6 months with a neutral leather cream, and keep it away from prolonged direct sunlight and soaking rain. Full-grain leather develops a patina with wear, which is the point. Never use silicone sprays or coloured polishes on light leathers.",
  },
  {
    title: "How can I track my order?",
    content:
      "Use the Track Order page with your order number (it looks like TT-2026-1042) and the mobile number you checked out with. You will see live status from placement to delivery. We also call every customer to confirm details before dispatch.",
  },
  {
    title: "Are your products genuine leather?",
    content:
      "Every Tann and Thread piece is cut from full-grain leather, the top layer of the hide, with solid brass hardware. We never use bonded, split or PU leather, and every product page lists the exact materials used.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-x py-10 sm:py-14">
      <SectionHeader
        eyebrow="Help centre"
        title="Frequently asked questions"
        copy="Everything about shipping, payments, exchanges, repairs and leather care."
      />
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-espresso/10 px-5 sm:px-8">
        <Accordion items={FAQS.map((f) => ({ title: f.title, content: <p>{f.content}</p> }))} />
      </div>
      <div className="mx-auto mt-8 max-w-3xl text-center">
        <p className="text-sm text-espresso/60">Still stuck? We reply within one working day.</p>
        <Link href="/contact">
          <Button variant="outline" className="mt-4">
            Contact us
          </Button>
        </Link>
      </div>
    </div>
  );
}
