import { KeyboardEvent } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  isActive?: boolean;
  isWarning?: boolean;
  onClick?: () => void;
}

const KpiCard = ({ title, value, subtitle, isActive, isWarning, onClick }: Props) => {
  const classNames = ['kpi-card'];
  if (onClick) classNames.push('clickable');
  if (isActive) classNames.push('active');
  if (isWarning) classNames.push('warning');

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classNames.join(' ')}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? isActive ?? false : undefined}
    >
      <p className="kpi-card-title muted">{title}</p>
      <p className="kpi-card-value">{value}</p>
      {subtitle && <p className="kpi-card-subtitle muted">{subtitle}</p>}
    </div>
  );
};

export default KpiCard;
