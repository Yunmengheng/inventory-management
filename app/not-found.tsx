import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">
      <div>
        <p className="font-serif text-6xl">404</p>
        <p className="mt-2 text-ink-soft">That page is not in the warehouse.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-forest px-4 py-2 text-sm text-white">Back to today</Link>
      </div>
    </div>
  );
}
