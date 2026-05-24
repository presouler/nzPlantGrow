import { notFound } from 'next/navigation';
import { getPlantDetail } from '../../../src/api/recommendations';
import { PlantDetailPage } from '../../../src/App';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000';

type PlantPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

export default async function Page({ params }: PlantPageProps) {
  const { id } = await params;

  try {
    const plant = await getPlantDetail(id, apiBaseUrl);
    return <PlantDetailPage plant={plant} />;
  } catch {
    notFound();
  }
}
