import { forwardRef, InputHTMLAttributes } from "react";
import { Search } from "lucide-react";


type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = "w-4/5", placeholder = "search for item", ...props }, ref) => {
    return (
      <div
        className={`flex items-center border border-gray-300 rounded-lg bg-white px-4 py-3 ${className}`}
      >
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="
            flex-1
            text-lg
            placeholder-gray-400
            outline-none
            bg-transparent
          "
          {...props}
        />
        <Search className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
      </div>
    );
  }
);

export default SearchBar;