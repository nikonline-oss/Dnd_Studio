import { commands, type ActiveCampaign, type CampaignSummary } from './bindings';

async function unwrap<T, E>(
    promise: Promise<{ status: "ok"; data: T } | { status: "error"; error: E }>
): Promise<T> {
    const result = await promise;

    if (result.status === "ok") {
        return result.data;
    }

    throw result.error;
}

export async function createCampaign(name: string): Promise<CampaignSummary> {
    return unwrap(commands.createCampaign(name));
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
    return unwrap(commands.listCampaigns());
}

export async function openCampaign(id: string): Promise<CampaignSummary> {
    return unwrap(commands.openCampaign(id));
}

export async function closeCampaign(): Promise<void> {
    unwrap(commands.closeCampaign());
}

export async function getActiveCampaign(): Promise<ActiveCampaign | null> {
    return unwrap(commands.getActiveCampaign());
}