import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold tracking-tight mb-2">Page Not Found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The requested resource does not exist on this dashboard.
      </p>
      <Link
        href="/"
        className="text-xs font-medium text-primary hover:underline px-3 py-1.5 rounded-md border border-border"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
