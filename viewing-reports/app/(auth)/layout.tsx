export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">ViewingReports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Professional viewing reports in seconds
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
