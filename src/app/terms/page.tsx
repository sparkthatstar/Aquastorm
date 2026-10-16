export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 px-4 py-10 text-white">
      <article className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-black/20 p-6 sm:p-10">
        <a
          href="/signup"
          className="mb-6 inline-block text-cyan-300 underline hover:text-white"
        >
          ← Back to Sign Up
        </a>

        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          AQUASTORM Terms and Conditions
        </h1>

        <p className="mb-8 text-sm text-cyan-200">
          Last updated: 15 October 2026
        </p>

        <section className="text-base leading-8 text-white">
          <p>
            By using AQUASTORM, I agree to provide accurate information, make
            payment before order processing, and upload valid proof of payment
            when required. I understand that delivery times may vary depending
            on availability and operational conditions. I agree to use
            AQUASTORM&apos;s services responsibly and comply with its policies.
          </p>
        </section>

        <div className="mt-10 border-t border-white/20 pt-5">
          <a
            href="/privacy"
            className="font-semibold text-cyan-300 underline hover:text-white"
          >
            Read our Privacy Policy →
          </a>
        </div>
      </article>
    </main>
  )
}
