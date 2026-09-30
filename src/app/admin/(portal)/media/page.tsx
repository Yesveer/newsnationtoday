import { MediaLibraryView } from "@/components/admin/media/media-library-view";
import { getMediaItems } from "@/lib/data/admin/get-admin-data";

export const metadata = { title: "मीडिया लाइब्रेरी" };

export default async function MediaPage() {
  const items = await getMediaItems();
  return <MediaLibraryView items={items} />;
}
