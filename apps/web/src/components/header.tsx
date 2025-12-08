import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-stone-800/50 border-b bg-stone-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link className="flex items-center gap-2" to="/">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-400">
            <svg
              className="h-4 w-4 text-stone-900"
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
          <span className="font-medium text-stone-100">BucketKit</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            activeProps={{
              className: "text-stone-100 bg-stone-800/50",
            }}
            className="rounded-md px-3 py-1.5 text-sm text-stone-400 transition-colors hover:text-stone-100"
            to="/"
          >
            Home
          </Link>
          <Link
            activeProps={{
              className: "text-stone-100 bg-stone-800/50",
            }}
            className="rounded-md px-3 py-1.5 text-sm text-stone-400 transition-colors hover:text-stone-100"
            to="/upload"
          >
            Demo
          </Link>
          <a
            className="rounded-md px-3 py-1.5 text-sm text-stone-400 transition-colors hover:text-stone-100"
            href="https://bukketkit-docs.nilovon.com/"
          >
            Docs
          </a>
          <a
            className="ml-2 flex items-center gap-1.5 rounded-md bg-stone-800/50 px-3 py-1.5 text-sm text-stone-300 transition-colors hover:bg-stone-800"
            href="https://github.com/nilovon/bucketkit"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
