'use client'
import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info) }
  handleReset() { this.setState({ hasError: false, error: null }) }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback)  return this.props.fallback
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fef2f2' }}>
            <AlertTriangle size={22} style={{ color: '#ef4444' }} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Algo deu errado</h3>
          <p className="text-sm text-gray-500 mb-1">Ocorreu um erro inesperado nesta seção.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <p className="text-xs font-mono text-red-500 bg-red-50 rounded-lg p-2 mt-2 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <button onClick={() => this.handleReset()}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      </div>
    )
  }
}
