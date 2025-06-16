
import type { SVGProps } from 'react';

export function MacSphereLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>MacSphere 博客标志</title>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0-7.07 17.07M12 22a10 10 0 0 0 7.07-17.07" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20" />
      <path d="M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}
