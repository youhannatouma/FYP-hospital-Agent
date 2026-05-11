import { auth } from "@clerk/nextjs/server";

function resolveServerTokenTemplate(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim();
  return raw ? raw : undefined;
}

export async function getServerClerkToken(): Promise<string | null> {
  const { getToken } = await auth();
  const template = resolveServerTokenTemplate();

  if (template) {
    const templated = await getToken({ template });
    if (templated) return templated;
  }

  return await getToken();
}
