// Superadmin email addresses - users with these emails will be automatically redirected to /admin
const SUPERADMIN_EMAILS = [
  'superadmin@gmail.com',
  'admin@gmail.com',
  // Add more superadmin emails as needed
]

export function isSuperAdmin(email) {
  if (!email) return false
  return SUPERADMIN_EMAILS.includes(email.toLowerCase())
}
