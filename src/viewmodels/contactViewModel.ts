import { getEntry } from "astro:content";

export interface ContactItem {
    icon: string;
    label?: string;
    href?: string;
    target?: string;
    rel?: string;
    description?: string;
}

export interface ContactSection {
    title: string;
    description?: string;
    items: ContactItem[];
}

export type ContactSections = Record<string, ContactSection>;

export interface ContactViewModel {
    Content: any;
    sections: ContactSections;
}

/**
 * Contact page view model
 * Fetches contact data for the contact page
 */
export async function getContactViewModel(): Promise<ContactViewModel> {
    const contactEntry = await getEntry("contact", "info");
    const { Content } = await contactEntry.render();

    return {
        Content,
        sections: contactEntry.data.sections,
    };
}
