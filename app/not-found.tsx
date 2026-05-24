import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app-shell loading">
      <Link className="back-link" href="/">← Back to recommendations</Link>
      Plant details could not be loaded from the backend. Please go back and try again.
    </main>
  );
}
