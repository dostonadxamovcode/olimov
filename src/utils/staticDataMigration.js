/**
 * STATIC DATA MIGRATION SCRIPT
 * 
 * Bu script barcha hardcoded static ma'lumotlarni Firebase Firestore ga ko'chiradi.
 * 
 * Usage:
 * 1. Bu faylni browser console da yoki devtools da run qiling
 * 2. Yoki maxsus migration page yaratib run qiling
 */

import { initializeAllStaticData } from '../services/staticData'

// Migration status
export const migrateStaticData = async () => {
  console.log('🚀 Starting static data migration...')
  
  try {
    const results = await initializeAllStaticData()
    
    console.log('✅ Migration completed!')
    console.table(results)
    
    const successCount = results.filter(r => r.status === 'initialized' || r.status === 'exists').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    console.log(`\n📊 Summary:`)
    console.log(`- Total collections: ${results.length}`)
    console.log(`- Success: ${successCount}`)
    console.log(`- Errors: ${errorCount}`)
    
    if (errorCount > 0) {
      console.error('❌ Some collections failed to migrate:')
      results.filter(r => r.status === 'error').forEach(r => {
        console.error(`  - ${r.collection}: ${r.error}`)
      })
    }
    
    return results
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Browser console uchun global function
if (typeof window !== 'undefined') {
  window.migrateStaticData = migrateStaticData
  console.log('💡 Migration function available: window.migrateStaticData()')
}

export default migrateStaticData