
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type DropdownProps = {
  name: string;
  className?: string;
  children: React.ReactNode; // body content
};

const Dropdown: React.FC<DropdownProps> = ({
  name,
  children,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="
          flex items-center justify-between
          w-full
          py-2
          cursor-pointer
          select-none
          hover:opacity-80
          transition-opacity duration-150
        "
      >
        <span className="text-sm font-medium text-gray-800">{name}</span>

        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      <div className="border-b border-gray-200" />
      <div
        className={`
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0 py-0"}
        `}
      >
        <div className="pl-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;