import React, { forwardRef, InputHTMLAttributes } from "react";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = "", ...props }, ref) => {
    return (
        <>
        </>
    //   Implement here
    );
  }
);

export default SearchBar;