import type { Route } from './+types/home';

import mapUrl from '../../data/Empty 36x24.Civ6Map?url';
// import mapUrl from '../../data/Sumeria.Civ6Map?url';
import { Civ6Map } from '~/utils/civ6map';
import MapPreview from '~/components/map-preview';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export async function clientLoader() {
  const response = await fetch(mapUrl);
  if (!response.ok) {
    throw new Error(`Failed to load map: ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());

  return await Civ6Map.fromData(bytes);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <MapPreview map={loaderData} />
    </div>
  );
}
