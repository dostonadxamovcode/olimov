import toast from 'react-hot-toast'

export const getErrorMessage = (error) => {
  const code = error?.code || error?.message || ''

  // Auth errors
  if (code.includes('auth/user-not-found') || code.includes('auth/wrong-password') || code.includes('auth/invalid-credential'))
    return "Login yoki parol noto'g'ri kiritildi."
  if (code.includes('auth/email-already-in-use'))
    return "Bu elektron pochta manzili allaqachon ro'yxatdan o'tkazilgan."
  if (code.includes('auth/weak-password'))
    return "Parol kamida 6 ta belgidan iborat bo'lishi kerak."
  if (code.includes('auth/invalid-email'))
    return "Elektron pochta manzili noto'g'ri formatda."
  if (code.includes('auth/user-disabled'))
    return "Bu hisob bloklangan. Qo'llab-quvvatlash xizmatiga murojaat qiling."
  if (code.includes('auth/too-many-requests'))
    return "Juda ko'p urinish. Biroz kutib, qaytadan urinib ko'ring."
  if (code.includes('auth/requires-recent-login'))
    return "Ushbu amalni bajarish uchun qayta tizimga kiring."
  if (code.includes('auth/popup-closed-by-user'))
    return "Kirish oynasi yopildi. Qaytadan urinib ko'ring."
  if (code.includes('auth/cancelled-popup-request'))
    return "So'rov bekor qilindi. Qaytadan urinib ko'ring."
  if (code.includes('auth/account-exists-with-different-credential'))
    return "Bu pochta boshqa usul bilan ro'yxatdan o'tkazilgan."

  // Firestore errors
  if (code.includes('permission-denied'))
    return "Sizda ushbu amalni bajarish uchun ruxsat yo'q."
  if (code.includes('not-found'))
    return "So'ralgan ma'lumot topilmadi."
  if (code.includes('already-exists'))
    return "Bu ma'lumot allaqachon mavjud."
  if (code.includes('resource-exhausted'))
    return "So'rovlar limiti oshib ketdi. Keyinroq urinib ko'ring."
  if (code.includes('unavailable'))
    return "Xizmat vaqtincha mavjud emas. Keyinroq urinib ko'ring."
  if (code.includes('deadline-exceeded'))
    return "So'rov vaqti tugadi. Qaytadan urinib ko'ring."
  if (code.includes('aborted'))
    return "Amal bekor qilindi. Qaytadan urinib ko'ring."

  // Network errors
  if (code.includes('network-request-failed') || code.includes('NetworkError') || code.includes('Failed to fetch'))
    return "Internet aloqasi mavjud emas. Tarmoqni tekshiring."

  // Storage errors
  if (code.includes('storage/unauthorized'))
    return "Faylni yuklash uchun ruxsat yo'q."
  if (code.includes('storage/object-not-found'))
    return "Fayl topilmadi."
  if (code.includes('storage/quota-exceeded'))
    return "Saqlash limiti oshib ketdi."

  return "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
}

export const toastError = (error) => {
  const message = typeof error === 'string' ? error : getErrorMessage(error)
  toast.error(message)
}

export const toastSuccess = (message) => {
  toast.success(message)
}
