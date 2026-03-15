"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Log In</h1>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-2"
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
