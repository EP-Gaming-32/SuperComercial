
export default function BoxComponent({ children, className, style }) {
    return (
      <div
        className={`box-container ${className || ''}`}
        style={{
          padding: '1rem',
          maxHeight: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
  