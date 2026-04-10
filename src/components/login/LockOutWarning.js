function LockoutWarning({ lockoutInfo, secondsLeft }) {
  if (!lockoutInfo) return null;

  return (
    <div className="lockout-warning">
      <div className="lockout-icon">⚠️</div>
      <div className="lockout-content">
        <div className="lockout-title">Account Temporarily Locked</div>
        <div className="lockout-message">{lockoutInfo.message}</div>
        {secondsLeft > 0 && (
          <div className="lockout-progress">
            <div className="progress-text">{secondsLeft} seconds remaining</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(secondsLeft / lockoutInfo.secondsLeft) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LockoutWarning;