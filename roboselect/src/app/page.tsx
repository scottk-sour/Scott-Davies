export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to RoboSelect</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find the perfect robot for your business in 2 minutes
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Project structure created</p>
          <p>✅ Dependencies installed</p>
          <p>✅ Database schema ready</p>
          <p>✅ Configuration files set up</p>
          <p className="mt-4 text-primary font-semibold">
            Ready to start building features!
          </p>
        </div>
      </div>
    </main>
  );
}
