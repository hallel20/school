import { ErrorInfo } from "react";

const DevelopmentErrorDisplay = ({
  error,
  errorInfo,
}: {
  error: Error;
  errorInfo: ErrorInfo;
}) => {
  return (
    <div
      style={{
        fontFamily:
          '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
        padding: '2rem',
        backgroundColor: '#1e1e1e', // Dark background
        color: '#d4d4d4', // Light text
        minHeight: '100vh',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          color: '#ce9178',
          borderBottom: '1px solid #444',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          fontSize: '1.8rem',
        }}
      >
        Unhandled Error
      </h1>
      <h2
        style={{
          color: '#ce9178',
          marginTop: '1.5rem',
          marginBottom: '0.5rem',
          fontSize: '1.4rem',
        }}
      >
        {error.name}: {error.message}
      </h2>

      {error.stack && (
        <details open style={{ marginTop: '1rem', color: '#9cdcfe' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
            }}
          >
            Stack Trace
          </summary>
          <pre
            style={{
              backgroundColor: '#252526',
              padding: '1rem',
              borderRadius: '4px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: '#dcdcaa',
              fontSize: '0.9rem',
              lineHeight: '1.6',
            }}
          >
            {error.stack}
          </pre>
        </details>
      )}

      {errorInfo && errorInfo.componentStack && (
        <details open style={{ marginTop: '1rem', color: '#9cdcfe' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
            }}
          >
            Component Stack
          </summary>
          <pre
            style={{
              backgroundColor: '#252526',
              padding: '1rem',
              borderRadius: '4px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: '#c586c0',
              fontSize: '0.9rem',
              lineHeight: '1.6',
            }}
          >
            {errorInfo.componentStack}
          </pre>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        Reload Page
      </button>
    </div>
  );
};


export default DevelopmentErrorDisplay