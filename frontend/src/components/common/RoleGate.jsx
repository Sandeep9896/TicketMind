import { useAuth } from '../../hooks/useAuth';

const RoleGate = ({ roles = [], children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return fallback;
  }

  return children;
};

export default RoleGate;
