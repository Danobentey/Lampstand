import SessionDetailView from "../../../components/session-detail-view";

export default async function SessionHistoryPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <SessionDetailView sessionId={sessionId} />;
}