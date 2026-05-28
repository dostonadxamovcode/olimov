
import { ArrowLeft, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MockTestsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen site-bg py-8 px-4 sm:px-6 lg:px-8 mt-[60px]">
      <div className="max-w-4xl mx-auto">
        <div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="premium-card p-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-orange-400" />
            <h1 className="text-3xl font-bold text-white mb-2">Mock Tests Page</h1>
            <p className="text-gray-400">This page is under construction</p>
          </div>
        </div>
      </div>
    </div>
  )
}
