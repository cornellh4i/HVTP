"use client";

import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <form className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            className="w-full rounded border p-2"
          />
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
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
