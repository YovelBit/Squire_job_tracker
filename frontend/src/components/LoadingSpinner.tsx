const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
      <div
        style={{
          width: 36,
          height: 36,
          border: '4px solid #cbd5e1',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}
      </style>
    </div>
  );
};

export default LoadingSpinner;
