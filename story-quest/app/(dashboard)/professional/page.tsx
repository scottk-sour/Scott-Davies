import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export default async function ProfessionalPage() {
  const session = await auth()

  if (!session || session.user.role === 'PARENT') {
    redirect('/dashboard')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Professional Tools</h1>
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Professional tools including child insights, therapeutic notes, and
            conversation guides are being developed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
