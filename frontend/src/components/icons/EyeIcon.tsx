import type { FC, SVGProps } from "react";

export const EyeIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
    <path d="M12 5.5c4.5 0 7.9 2.2 10 6.5-2.1 4.3-5.5 6.5-10 6.5S4.1 16.3 2 12c2.1-4.3 5.5-6.5 10-6.5Z" />
    <circle cx="12" cy="12" r="3.3" fill="var(--background-secondary)" />
  </svg>
);
