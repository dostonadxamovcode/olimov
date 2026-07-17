// This script requires firebase-service-account.json in the project root
// To get the service account key:
// 1. Go to Firebase Console -> Project Settings -> Service Accounts
// 2. Click "Generate New Private Key"
// 3. Save it as firebase-service-account.json in the project root
// 4. Run: node scripts/migrate-unit-tests.cjs

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// Load service account key
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json')

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ firebase-service-account.json not found!')
  console.error('')
  console.error('To run this migration script:')
  console.error('1. Go to Firebase Console -> Project Settings -> Service Accounts')
  console.error('2. Click "Generate New Private Key"')
  console.error('3. Save it as firebase-service-account.json in the project root')
  console.error('4. Run: node scripts/migrate-unit-tests.cjs')
  console.error('')
  process.exit(1)
}

const serviceAccount = require(serviceAccountPath)

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function migrateUnitTests() {
  console.log('🚀 Starting Unit Tests migration...')
  console.log('=====================================\n')

  let totalUnits = 0
  let totalQuestionsBefore = 0
  let totalQuestionsAfter = 0
  let totalDeleted = 0
  let unitsUpdated = 0

  try {
    // Fetch all unitTests
    console.log('📥 Fetching all unitTests from Firestore...')
    const unitTestsSnapshot = await db.collection('unitTests').get()
    totalUnits = unitTestsSnapshot.size

    if (totalUnits === 0) {
      console.log('✅ No unitTests found. Nothing to migrate.')
      return
    }

    console.log(`📊 Found ${totalUnits} units\n`)

    // Process each unit
    for (const doc of unitTestsSnapshot.docs) {
      const unitId = doc.id
      const unitData = doc.data()
      const exercises = unitData.exercises || []

      const beforeCount = exercises.length

      // Filter out unwanted question types
      const filteredExercises = exercises.filter(exercise => 
        ['fill_blank', 'multiple_choice', 'true_false'].includes(exercise.type)
      )

      const afterCount = filteredExercises.length
      const deletedCount = beforeCount - afterCount

      totalQuestionsBefore += beforeCount
      totalQuestionsAfter += afterCount
      totalDeleted += deletedCount

      if (deletedCount > 0) {
        console.log(`📝 Unit: ${unitData.title || unitId}`)
        console.log(`   Questions before: ${beforeCount}`)
        console.log(`   Questions after: ${afterCount}`)
        console.log(`   Deleted: ${deletedCount}`)

        // Update the document
        await db.collection('unitTests').doc(unitId).update({
          exercises: filteredExercises,
          updatedAt: new Date()
        })

        unitsUpdated++
        console.log(`   ✅ Updated\n`)
      } else {
        console.log(`✓ Unit: ${unitData.title || unitId} - No changes needed\n`)
      }
    }

    console.log('=====================================')
    console.log('📊 Migration Summary')
    console.log('=====================================')
    console.log(`Total Units: ${totalUnits}`)
    console.log(`Units Updated: ${unitsUpdated}`)
    console.log(`Questions Before: ${totalQuestionsBefore}`)
    console.log(`Questions After: ${totalQuestionsAfter}`)
    console.log(`Questions Deleted: ${totalDeleted}`)
    console.log('=====================================')
    console.log('✅ Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateUnitTests().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
