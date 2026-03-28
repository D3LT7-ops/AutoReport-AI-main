import Sidebar from '../../components/sidebar/Sidebar'
import AuthGuard from '../../components/AuthGuard'
import ErrorBoundary from '../../components/ErrorBoundary'

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </AuthGuard>
  )
}
