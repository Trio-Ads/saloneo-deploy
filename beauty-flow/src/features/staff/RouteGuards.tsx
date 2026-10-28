import React from 'react';
import { Navigate } from 'react-router-dom';
import { Perm, useAccess } from './access';

/** Staff land on their planning; these wrap app routes (the API refuses the calls anyway). */
export const STAFF_HOME = '/my-planning';

/** Owner/admin pages: a staff login is sent to its planning. */
export const OwnerOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isStaff } = useAccess();
  return isStaff ? <Navigate to={STAFF_HOME} replace /> : children;
};

/** Staff space pages: owners go back to their dashboard. */
export const StaffOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isStaff } = useAccess();
  return isStaff ? children : <Navigate to="/dashboard" replace />;
};

/** Pages a staff login may open with a given permission (owners always). */
export const Allowed: React.FC<{ perm: Perm; children: React.ReactElement }> = ({ perm, children }) => {
  const { can } = useAccess();
  return can(perm) ? children : <Navigate to={STAFF_HOME} replace />;
};
