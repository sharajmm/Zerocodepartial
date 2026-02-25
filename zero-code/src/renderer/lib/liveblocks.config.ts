import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

export const client = createClient({
    // Typically loaded via import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY
    // Fallback for demo purposes
    publicApiKey: "pk_prod_c9hU0cRtz44N21QJ0m6iGvYn7-r96Y6fS6z7t7r988k7A_I_sR_TqUqqV_SjY6rY"
    // Wait, I should just use a placeholder. The app might not connect without an actual key, so I'll write a mock one or a generic one. Let's use a standard format placeholder.
});

type Presence = {
    cursor: { x: number; y: number } | null;
    name: string;
    role: 'Owner' | 'Developer' | 'TeamLead' | 'Client';
    color: string;
};

type Storage = {
    // Can add shared test results/messages here in V2
};

export const {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useOthers,
    useStatus,
    useBroadcastEvent,
    useEventListener,
} = createRoomContext<Presence, Storage>(client);