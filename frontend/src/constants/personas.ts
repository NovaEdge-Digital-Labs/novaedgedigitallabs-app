import type { Persona } from '../store/authStore';

/**
 * Single source of truth for persona-driven UI.
 *
 * `personas` on the user answers "what did you come here to do?" and is kept
 * separate from `role` (user/admin), which is a permission level. Everything
 * below is presentation only — no gating, no privileges.
 *
 * Used by: RolePickerScreen (the picker), HomeScreen (which action cards to show
 * first) and ProfileScreen (which menu item floats to the top).
 */

export interface PersonaConfig {
    key: Persona;
    /** Shown in the onboarding picker */
    label: string;
    subtitle: string;
    icon: string;
    /** The one action this persona came for — surfaced first on Home */
    primaryAction: {
        title: string;
        subtitle: string;
        icon: string;
        /** Tab to jump to */
        tab: string;
        /** Optional screen inside that tab's stack */
        screen?: string;
    };
    /** Profile menu item that should float to the top for this persona */
    profileTopItem: string;
}

export const PERSONAS: PersonaConfig[] = [
    {
        key: 'client',
        label: 'Kaam karwana hai',
        subtitle: 'Project post karo, freelancers hire karo',
        icon: 'briefcase-outline',
        primaryAction: {
            title: 'Post a Project',
            subtitle: 'Freelancers se proposals pao',
            icon: 'add-circle-outline',
            tab: 'Marketplace',
            screen: 'CreateProject'
        },
        profileTopItem: 'My Workspace'
    },
    {
        key: 'freelancer',
        label: 'Kaam chahiye',
        subtitle: 'Projects browse karo, gigs becho',
        icon: 'construct-outline',
        primaryAction: {
            title: 'Browse Projects',
            subtitle: 'Naye projects par proposal bhejo',
            icon: 'search-outline',
            tab: 'Marketplace'
        },
        profileTopItem: 'My Workspace'
    },
    {
        key: 'student',
        label: 'Seekhna hai',
        subtitle: 'Courses lo, skills banao',
        icon: 'school-outline',
        primaryAction: {
            title: 'Browse Courses',
            subtitle: 'Job-ready skills seekho',
            icon: 'play-circle-outline',
            tab: 'Academy'
        },
        profileTopItem: 'My Courses'
    },
    {
        key: 'jobseeker',
        label: 'Job chahiye',
        subtitle: 'Jobs dekho, apply karo',
        icon: 'document-text-outline',
        primaryAction: {
            title: 'Find Jobs',
            subtitle: 'Naye openings par apply karo',
            icon: 'briefcase-outline',
            tab: 'Jobs'
        },
        profileTopItem: 'My Applications'
    },
    {
        key: 'employer',
        label: 'Hiring kar raha hoon',
        subtitle: 'Job post karo, applicants manage karo',
        icon: 'business-outline',
        primaryAction: {
            title: 'Post a Job',
            subtitle: 'Candidates tak pahuncho',
            icon: 'megaphone-outline',
            tab: 'Jobs',
            screen: 'PostJob'
        },
        profileTopItem: 'Received Applicants'
    }
];

export const getPersonaConfig = (key: Persona): PersonaConfig | undefined =>
    PERSONAS.find((p) => p.key === key);

/**
 * Action cards for Home, ordered by the user's own personas first.
 * A user with no personas set (or a guest) sees all of them — that is the
 * correct default for a multi-role product: show every door, don't guess.
 */
export const getOrderedPersonas = (userPersonas?: Persona[]): PersonaConfig[] => {
    if (!userPersonas || userPersonas.length === 0) return PERSONAS;

    const selected = PERSONAS.filter((p) => userPersonas.includes(p.key));
    const rest = PERSONAS.filter((p) => !userPersonas.includes(p.key));
    return [...selected, ...rest];
};

/** Profile menu items that this user's personas want at the top. */
export const getPriorityMenuItems = (userPersonas?: Persona[]): string[] => {
    if (!userPersonas || userPersonas.length === 0) return [];
    return [
        ...new Set(
            userPersonas
                .map((key) => getPersonaConfig(key)?.profileTopItem)
                .filter((item): item is string => Boolean(item))
        )
    ];
};
