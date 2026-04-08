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
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="flex flex-col max-w-2xl p-6 text-center gap-y-4">
        <h1 className="text-2xl font-bold">HVTP</h1>
        <p>
          Go to the <Link  className="text-blue-300 " href="/login">Login</Link> page.
        </p>

        <Button variant="default" asChild>
          <Link href="/public/inventory">View Public Inventory</Link>
        </Button>
      </div>
    </main>
  );
}
