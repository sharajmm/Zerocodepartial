import type { ReactNode } from 'react';
import { useCollabStore } from '../../store/collabStore';

interface RoleGateProps {
    allowedRoles: Array<'Owner' | 'Developer' | 'TeamLead' | 'Client'>;
    children: ReactNode;
    fallback?: ReactNode;
}

export default function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
    const role = useCollabStore(state => state.role);

    // If not in a room, you effectively own your local session so render
    const roomId = useCollabStore(state => state.roomId);
    if (!roomId) return <>{children}</>;

    if (!allowedRoles.includes(role)) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
}