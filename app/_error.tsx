// app/_error.tsx
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/_not-found.tsx
export default function NotFound() {
  return <h1>Page not found</h1>;
}
