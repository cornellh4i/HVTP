import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <Card className="w-full p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex h-[105px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 sm:h-[120px] sm:w-[245px] sm:min-w-[245px]">
              <svg
                width="74"
                height="74"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-500"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.75"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M4.5 18L11 11.5C11.5 11 12.3 11 12.9 11.5L16 14.2C16.6 14.7 17.4 14.7 17.9 14.2L19.5 12.7"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <CardHeader className="gap-1 p-0">
                  <CardDescription>
                    PREMIUM LONG • NATURAL COLOR
                  </CardDescription>
                  <CardTitle>R9pL2bN5kW</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-x-6 gap-y-1 px-0 pb-0 pt-2 sm:grid-cols-2 sm:pt-3">
                  <p>
                    <span className="font-semibold">Breed:</span> Highland Cross
                  </p>
                  <p>
                    <span className="font-semibold">Quantity Available:</span>{" "}
                    23.5 lbs
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span> Scoured Wool
                  </p>
                  <p>
                    <span className="font-semibold">State:</span> NY
                  </p>
                </CardContent>
              </div>

              <CardFooter className="shrink-0 items-center justify-center px-0 py-0 sm:self-center">
                <button className="rounded-xl bg-slate-600 px-5 py-2 text-white">
                  View Fiber
                </button>
              </CardFooter>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
