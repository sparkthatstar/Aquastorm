export default function PrivacyPage() {
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
          AQUASTORM Privacy Policy
        </h1>

        <p className="mb-8 text-sm text-cyan-200">
          Last updated: 15 October 2026
        </p>

        <section className="text-base leading-8 text-white">
          <p>
            AQUASTORM collects and uses necessary customer information, such as
            names, contact details, hostel and room numbers, account
            information, order details, and payment receipts, to manage
            accounts, process orders, arrange deliveries, provide support, and
            maintain records. Customer information will be handled responsibly
            and protected against unauthorized access or disclosure, in
            accordance with applicable data protection laws. Information may
            be shared with authorized personnel or service providers when
            necessary to fulfil orders or operate the service.
          </p>
        </section>

        <div className="mt-10 border-t border-white/20 pt-5">
          <a
            href="/terms"
            className="font-semibold text-cyan-300 underline hover:text-white"
          >
            ← Read our Terms and Conditions
          </a>
        </div>
      </article>
    </main>
  )
}
