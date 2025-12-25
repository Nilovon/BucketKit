import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="grain min-h-screen">
      {/* Hero Section */}
      <section className="px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-amber-400 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Open Source
          </div>

          {/* Title */}
          <h1 className="mb-6 font-semibold text-5xl text-stone-100 tracking-tight sm:text-6xl">
            S3 uploads,
            <br />
            <span className="text-amber-400">simplified.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-xl text-lg text-stone-400 leading-relaxed">
            Type-safe library for handling file uploads to S3. Beautiful React
            components, presigned URLs, and sensible defaults.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-medium text-stone-900 transition-colors hover:bg-amber-300"
              to="/upload"
            >
              Try Demo
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-6 py-3 font-medium text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100"
              href="https://bucketkit-docs.nilovon.com/"
            >
              Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900/50">
            <div className="flex items-center gap-2 border-stone-800 border-b px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-stone-700" />
              <div className="h-3 w-3 rounded-full bg-stone-700" />
              <div className="h-3 w-3 rounded-full bg-stone-700" />
              <span className="ml-3 font-mono text-stone-500 text-xs">
                example.tsx
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
              <code>
                <span className="text-stone-500">{"// Frontend"}</span>
                {"\n"}
                <span className="text-rose-400">import</span>
                <span className="text-stone-300">{" { "}</span>
                <span className="text-stone-100">BucketKitDropzone</span>
                <span className="text-stone-300">{" } "}</span>
                <span className="text-rose-400">from</span>
                <span className="text-amber-300">
                  {" "}
                  "@nilovonjs/bucketkit-react"
                </span>
                {"\n\n"}
                <span className="text-rose-400">{"<"}</span>
                <span className="text-amber-400">BucketKitProvider</span>
                <span className="text-sky-300"> endpoint</span>
                <span className="text-stone-400">=</span>
                <span className="text-amber-300">"/api/upload"</span>
                <span className="text-rose-400">{">"}</span>
                {"\n"}
                <span className="text-stone-400">{"  "}</span>
                <span className="text-rose-400">{"<"}</span>
                <span className="text-amber-400">BucketKitDropzone</span>
                <span className="text-rose-400">{" />"}</span>
                {"\n"}
                <span className="text-rose-400">{"</"}</span>
                <span className="text-amber-400">BucketKitProvider</span>
                <span className="text-rose-400">{">"}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-stone-800/50 border-t px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-px overflow-hidden rounded-xl border border-stone-800 bg-stone-800 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              description="Strict types for APIs and components"
              title="Type-Safe"
            />
            <FeatureCard
              description="Direct S3 uploads via presigned URLs"
              title="Fast Uploads"
            />
            <FeatureCard
              description="Dropzone, Button, Progress List"
              title="React Components"
            />
            <FeatureCard
              description="Max size, MIME types, custom paths"
              title="Validation"
            />
            <FeatureCard
              description="Real-time progress with cancel support"
              title="Progress Tracking"
            />
            <FeatureCard
              description="AWS S3, MinIO, Cloudflare R2"
              title="S3 Compatible"
            />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="border-stone-800/50 border-t px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-medium text-2xl text-stone-100">
            Two packages, one solution
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-stone-800 bg-stone-900/30 p-6">
              <div className="mb-3 font-mono text-amber-400 text-sm">
                @nilovonjs/bucketkit-core
              </div>
              <p className="mb-4 text-sm text-stone-400">
                Backend utilities for presigned URLs, validation, and storage
                policies.
              </p>
              <div className="code-block">
                <code>pnpm add @nilovonjs/bucketkit-core</code>
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-900/30 p-6">
              <div className="mb-3 font-mono text-amber-400 text-sm">
                @nilovonjs/bucketkit-react
              </div>
              <p className="mb-4 text-sm text-stone-400">
                React components and hooks for beautiful upload interfaces.
              </p>
              <div className="code-block">
                <code>pnpm add @nilovonjs/bucketkit-react</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-stone-800/50 border-t px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 font-medium text-2xl text-stone-100">
            Ready to get started?
          </h2>
          <p className="mb-8 text-stone-400">
            Try the interactive demo or check out the documentation.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-medium text-stone-900 transition-colors hover:bg-amber-300"
              to="/upload"
            >
              Open Demo
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              className="inline-flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-100"
              href="https://github.com/nilovon/bucketkit"
            >
              <GitHubIcon className="h-5 w-5" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-stone-800/50 border-t px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-stone-600">
            Built by{" "}
            <a
              className="text-stone-500 hover:text-stone-400"
              href="https://nilovon.com"
            >
              Nilovon
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-stone-900/50 p-6">
      <h3 className="mb-1 font-medium text-stone-100">{title}</h3>
      <p className="text-sm text-stone-500">{description}</p>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M17 8l4 4m0 0l-4 4m4-4H3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
