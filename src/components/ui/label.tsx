import type React from "react";

export interface LabelProps extends React.ComponentProps<"label"> {
  children: React.ReactNode;
}

export const Label = ({ children, htmlFor, ...rest }: LabelProps) => (
  <label
    htmlFor={htmlFor}
    className="text-xs font-medium text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2"
    {...rest}
  >
    {children}
  </label>
);
