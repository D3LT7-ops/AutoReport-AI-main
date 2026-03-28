export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

export const formatDateInput = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

export const formatPercent = (value) => {
  return `${value >= 0 ? '+' : ''}${value?.toFixed(1)}%`
}

export const getMonthName = (monthIndex) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return months[monthIndex]
}

export const getCurrentMonthYear = () => {
  const now = new Date()
  return `${getMonthName(now.getMonth())} ${now.getFullYear()}`
}