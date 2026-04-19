import { PublicTeamMember } from '../../types';

interface Props {
  member: PublicTeamMember;
  size?: 'sm' | 'md' | 'lg' | string;  // string for free-form class (TeamSpotlight uses 'w-32 h-32')
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-14 h-14 text-lg',
  lg: 'w-24 h-24 text-3xl',
};

export function MemberAvatar({ member, size = 'md', className }: Props) {
  const sizeClass = SIZE_MAP[size as keyof typeof SIZE_MAP] ?? size;
  const fullName = `${member.firstName} ${member.lastName}`;
  const initials = `${member.firstName?.[0] ?? '?'}${member.lastName?.[0] ?? '?'}`;

  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={fullName}
        className={`${sizeClass} rounded-full object-cover ${className ?? ''}`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white ${className ?? ''}`}
      style={{ background: member.color || '#6366F1' }}
      aria-label={fullName}
    >
      {initials}
    </div>
  );
}
