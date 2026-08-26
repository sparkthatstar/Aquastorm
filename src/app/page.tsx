import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-700 p-4 text-white">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">💧</div>
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">AquaStorm</h1>
        <p className="text-xl text-cyan-100 mb-10 font-light">
          Fresh, pure water delivered straight to your door. Fast.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link href="/login" className="w-full bg-white text-cyan-600 font-bold py-4 rounded-xl shadow-lg hover:bg-cyan-50 transition-colors text-lg">
            Log In
          </Link>
          <Link href="/signup" className="w-full bg-cyan-600/40 border-2 border-white text-white font-bold py-4 rounded-xl hover:bg-cyan-600/60 transition-colors text-lg">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
