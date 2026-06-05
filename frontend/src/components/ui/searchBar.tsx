import { forwardRef, InputHTMLAttributes } from "react";
import { Search, ScanLine } from "lucide-react";
import Link from "next/link";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  scanHref?: string;
};

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = "w-4/5", placeholder = "search for item", scanHref, ...props }, ref) => {
    return (
      <div
        className={`flex h-14 items-center gap-3 rounded-2xl border border-[#b8b1a2] bg-white px-4 ${className}`}
      >
        <Search className="h-5 w-5 flex-shrink-0 text-[#939393]" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-[#222] placeholder:text-[#9f9f9f] outline-none"
          {...props}
        />
        {scanHref && (
          <Link href={scanHref} className="md:hidden shrink-0 text-[#939393]">
            <ScanLine className="h-5 w-5" />
          </Link>
        )}
      </div>
    );
  }
);

export default SearchBar;
