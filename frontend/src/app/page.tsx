import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

import { ItemCard } from "@/components/ui/itemCard";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">HVTP</h1>
        <p>
          Go to the <Link  className="text-blue-300 " href="/login">Login</Link> page.
        </p>

          <ItemCard
            sku="This is just a visual Test card"
            description="PREMIUM LONG • NATURAL COLOR"
            breed="Highland Cross"
            quantity="23.5 lbs"
            status="Scoured Wool"
            state="NY"
            href="/inventory"
          />
      </div>
    </main>
  );
}
