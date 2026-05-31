import { LeadProfile } from "@/components/leads/lead-profile";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadProfile id={id} />;
}
