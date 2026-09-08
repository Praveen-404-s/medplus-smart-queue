import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ffffff', background: '#02140d', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#00c885' }}>MedPlus Smart Queue AI</h2>
          <p>Application encountered a display exception. Click below to refresh.</p>
          <pre style={{ background: '#05241b', padding: '16px', borderRadius: '8px', color: '#38bdf8', overflowX: 'auto', margin: '20px 0' }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', background: '#00c885', color: '#02140d', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
