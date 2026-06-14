type MailchimpPaged<T> = {
  lists?: T[];
  automations?: T[];
  total_items?: number;
};

export function mailchimpOAuthHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `OAuth ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchMailchimpOAuthMetadata(
  accessToken: string,
): Promise<
  | { ok: true; datacenter: string; apiEndpoint: string; accountName: string }
  | { ok: false; error: string }
> {
  const res = await fetch("https://login.mailchimp.com/oauth2/metadata", {
    headers: mailchimpOAuthHeaders(accessToken),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Mailchimp metadata ${res.status}` };
  }

  const json = (await res.json()) as {
    dc?: string;
    api_endpoint?: string;
    accountname?: string;
  };

  if (!json.dc || !json.api_endpoint) {
    return { ok: false, error: "Mailchimp metadata missing datacenter." };
  }

  return {
    ok: true,
    datacenter: json.dc,
    apiEndpoint: json.api_endpoint.replace(/\/$/, ""),
    accountName: json.accountname?.trim() || "Mailchimp",
  };
}

export async function fetchMailchimpLists(
  apiEndpoint: string,
  accessToken: string,
): Promise<{ id: string; name: string; memberCount: number }[]> {
  const res = await fetch(`${apiEndpoint}/3.0/lists?count=50&fields=lists.id,lists.name,lists.stats`, {
    headers: mailchimpOAuthHeaders(accessToken),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return [];

  const json = (await res.json()) as MailchimpPaged<{
    id: string;
    name: string;
    stats?: { member_count?: number };
  }>;

  return (json.lists ?? []).map((list) => ({
    id: list.id,
    name: list.name,
    memberCount: list.stats?.member_count ?? 0,
  }));
}

export async function fetchMailchimpAutomations(
  apiEndpoint: string,
  accessToken: string,
): Promise<
  { id: string; listId: string; title: string; status: string; emailId: string | null }[]
> {
  const res = await fetch(
    `${apiEndpoint}/3.0/automations?count=50&fields=automations.id,automations.settings,automations.status,automations.trigger_settings,automations.emails`,
    {
      headers: mailchimpOAuthHeaders(accessToken),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok) return [];

  const json = (await res.json()) as MailchimpPaged<{
    id: string;
    settings?: { title?: string };
    status?: string;
    trigger_settings?: { list_id?: string };
    emails?: { id: string }[];
  }>;

  return (json.automations ?? []).map((row) => ({
    id: row.id,
    listId: row.trigger_settings?.list_id ?? "",
    title: row.settings?.title?.trim() || row.id,
    status: row.status ?? "unknown",
    emailId: row.emails?.[0]?.id ?? null,
  }));
}

export async function queueMailchimpAutomationEmail(input: {
  apiEndpoint: string;
  accessToken: string;
  workflowId: string;
  workflowEmailId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `${input.apiEndpoint}/3.0/automations/${input.workflowId}/emails/${input.workflowEmailId}/queue`,
    {
      method: "POST",
      headers: mailchimpOAuthHeaders(input.accessToken),
      body: JSON.stringify({ email_address: input.email.trim().toLowerCase() }),
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Mailchimp ${res.status}` };
  }
  return { ok: true };
}

export async function fetchMailchimpListMemberEmails(
  apiEndpoint: string,
  accessToken: string,
  listId: string,
  limit = 500,
): Promise<string[]> {
  const emails: string[] = [];
  let offset = 0;
  const pageSize = 100;

  while (emails.length < limit) {
    const res = await fetch(
      `${apiEndpoint}/3.0/lists/${listId}/members?count=${pageSize}&offset=${offset}&fields=members.email_address`,
      {
        headers: mailchimpOAuthHeaders(accessToken),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) break;

    const json = (await res.json()) as { members?: { email_address?: string }[] };
    const batch = json.members ?? [];
    if (!batch.length) break;

    for (const member of batch) {
      const email = member.email_address?.trim().toLowerCase();
      if (email && email.includes("@")) emails.push(email);
      if (emails.length >= limit) break;
    }

    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return emails;
}
