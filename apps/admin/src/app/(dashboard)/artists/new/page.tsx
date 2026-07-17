import { ArtistForm } from "../artist-form";
import { emptyArtistFormValues } from "../schema";

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">New artist</h1>
        <p className="text-muted-foreground text-sm">
          Create a shared artist. Saving publishes immediately.
        </p>
      </div>
      <ArtistForm mode="create" defaultValues={emptyArtistFormValues} />
    </div>
  );
}
