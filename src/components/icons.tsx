export function Logo(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m4 6 8-4 8 4" />
      <path d="m12 2 8 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
      <path d="M10 12v-2" />
      <path d="m14 10 2-2" />
      <path d="M10 18v-2" />
      <path d="M14 18v-2" />
    </svg>
  );
}
