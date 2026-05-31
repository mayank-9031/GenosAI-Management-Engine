import { CallDetail } from "@/components/calling/call-detail";

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CallDetail id={id} />;
}
