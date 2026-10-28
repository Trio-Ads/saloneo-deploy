import React from 'react';
import clsx from 'clsx';

/** Round staff photo (square-cropped by object-cover), or the initials when there is none. */
export function StaffAvatar({ member, className = 'size-10 text-sm' }: {
  member: { firstName?: string; lastName?: string; avatar?: string };
  className?: string;
}) {
  if (member.avatar) {
    return <img src={member.avatar} alt="" loading="lazy" className={clsx('shrink-0 rounded-full bg-gray-100 object-cover dark:bg-gray-800', className)} />;
  }
  return (
    <span className={clsx('grid shrink-0 place-items-center rounded-full bg-gray-100 font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300', className)} aria-hidden="true">
      {`${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || '?'}
    </span>
  );
}
