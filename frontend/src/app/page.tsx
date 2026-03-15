import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-x-4">
        <h1 className="text-2xl font-bold">HVTP</h1>
        <p>
          Go to the <Link  className="text-blue-300 " href="/auth/login">Login</Link> page.
        </p>
      </div>
    </main>
  );
}
