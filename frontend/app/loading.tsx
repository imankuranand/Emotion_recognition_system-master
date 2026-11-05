/**
 * Route-level loading UI, shown while server components stream.
 */
export default function Loading() {
  return (
    <main
      id="main"
      className="container"
      style={{
        paddingTop: "8rem",
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
      }}
      aria-busy="true"
    >
      <p className="text-muted" role="status">
        Loading...
      </p>
    </main>
  );
}
