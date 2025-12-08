import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400">
            <svg
              className="h-3.5 w-3.5 text-stone-900"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-medium">BucketKit</span>
        </div>
      ),
    },
    links: [
      {
        text: "Demo",
        url: "https://bucketkit.nilovon.com/upload",
      },
      {
        text: "GitHub",
        url: "https://github.com/nilovon/bucketkit",
      },
    ],
  };
}
