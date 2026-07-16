import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { SectionLoader } from '../components/common/Loader'

export default function PracticeSession() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUnits() {
      try {
        setLoading(true)
        setError(null)
        const unitsRef = collection(db, 'unitTests')
        const querySnapshot = await getDocs(unitsRef)
        
        const units = []
        querySnapshot.forEach((doc) => {
          units.push({ id: doc.id, ...doc.data() })
        })
        
        if (units.length > 0) {
          units.sort((a, b) => a.order - b.order)
          setUnits(units)
        } else {
          setError('No units found. Please create units first.')
        }
      } catch (err) {
        console.error('Error fetching units:', err)
        setError('Failed to load units. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [])

  if (loading) {
    return (
      <>
        <SEO
          title="Practice Session"
          description="Practice your English skills with interactive exercises and tests."
          canonical="https://olimov.vercel.app/practice-session"
        />
        <div className="min-h-screen site-bg">
          <SectionLoader text="Loading..." minH="100vh" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <SEO
          title="Practice Session"
          description="Practice your English skills with interactive exercises and tests."
          canonical="https://olimov.vercel.app/practice-session"
        />
        <div className="min-h-screen site-bg">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => navigate('/seed-firestore')}
                className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                Create Units
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Practice Session"
        description="Practice your English skills with interactive exercises and tests."
        canonical="https://olimov.vercel.app/practice-session"
      />
      <div className="min-h-screen site-bg">
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/unit-tests')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <h1 className="text-xl font-bold text-white hidden sm:block">Grammar Units</h1>
              <h1 className="text-base font-bold text-white sm:hidden">Units</h1>
            </div>
          </div>
        </div>

        {/* Units Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div
                key={unit.id}
                onClick={() => navigate(`/unit-test/${unit.id}`)}
                className="premium-card p-6 cursor-pointer transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                    {unit.order}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{unit.title}</h3>
                    <p className="text-slate-400 text-sm">{unit.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{unit.exercises?.length || 0} exercises</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}