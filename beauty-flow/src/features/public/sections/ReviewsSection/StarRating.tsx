export function StarRating({ rating, color, size = 'base' }: {
  rating: number;
  color: string;
  size?: 'xs' | 'sm' | 'base';
}) {
  const sizeClass = size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? color : '#d1d5db' }} className={sizeClass}>
          ★
        </span>
      ))}
    </div>
  );
}
