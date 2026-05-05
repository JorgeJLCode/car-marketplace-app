import './SkeletonCard.css';

/**
 * SkeletonCard — Componente de carga visual.
 * 
 * UX Decision: Usar skeletons en lugar de un spinner genérico para la 
 * carga de la cuadrícula. Los skeletons mantienen la estructura de la 
 * página intacta, dando la percepción de que la aplicación es más rápida 
 * y evitando saltos de diseño (layout shifts) molestos.
 */
const SkeletonCard = () => {
  return (
    <div className="car-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="car-card-content skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
        <div className="skeleton-details">
          <div className="skeleton-icon-text"></div>
          <div className="skeleton-icon-text"></div>
        </div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
