"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getItemById, Item, updateItem } from "@/api/items";
import EditableField from "@/components/ui/EditableField";
import ItemImageUpload from "@/components/Admin/Inventory/Upload-Image/ItemImageUpload";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

export default function ViewForm() {
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { id: itemId } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getItemById(itemId);
        setItem(data);
        setImages(data.images ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load item.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  async function handlePublish() {
    if (!item) return;

    try {
      setSaving(true);
      setError(null);

      const nextCoverImage = images[0] ?? "";

      await updateItem(item.id, {
        images,
        coverImage: nextCoverImage,
      });

      setItem({
        ...item,
        images,
        coverImage: nextCoverImage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item.");
    } finally {
      setSaving(false);
    }
  }

  const BackLink = () => (
    <Link
      href="/inventory"
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
    >
      ← Back to Inventory
    </Link>
  );

  if (loading) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <BackLink />
        </div>
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );
  }

  if (error && !item) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <BackLink />
        </div>
        <h1 className="text-4xl font-bold text-red-600">{error}</h1>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <BackLink />
        </div>
        <h1 className="text-4xl font-bold">Item not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <BackLink />
        <div className="flex gap-2">
          <button className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50">
            Print Label
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-[400px_1fr] gap-10">
        <div className="flex flex-col gap-4">
          <ItemImageUpload
            sku={item.sku}
            existingImages={images}
            onImagesChange={setImages}
          />

          <Field label="Notes">
            <EditableField
              isEditing={false}
              value={item.notes ?? ""}
              placeholder="Notes"
              multiline
            />
          </Field>
        </div>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-xl font-bold mb-5">General Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Breed">
                <EditableField
                  isEditing={false}
                  value={item.breed ?? ""}
                  placeholder="Breed"
                />
              </Field>
              <Field label="Grade">
                <EditableField
                  isEditing={false}
                  value={item.grade ?? ""}
                  placeholder="Grade"
                />
              </Field>
              <Field label="Color">
                <EditableField
                  isEditing={false}
                  value={item.color ?? ""}
                  placeholder="Color"
                />
              </Field>
              <Field label="Weight (lb)">
                <EditableField
                  isEditing={false}
                  value={item.weight != null ? String(item.weight) : ""}
                  placeholder="Weight"
                />
              </Field>
              <Field label="Location">
                <EditableField
                  isEditing={false}
                  value={item.location ?? ""}
                  placeholder="Pallet Number"
                />
              </Field>
              <Field label="Status">
                <EditableField
                  isEditing={false}
                  value={item.status ?? ""}
                  placeholder="Status"
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-5">Purchase Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Farmer Name">
                <EditableField
                  isEditing={false}
                  value={item.farmerName ?? ""}
                  placeholder="Name"
                />
              </Field>
              <Field label="Farmer Contact">
                <EditableField
                  isEditing={false}
                  value={item.farmerContact ?? ""}
                  placeholder="Phone number or email"
                />
              </Field>
              <Field label="Farmer City">
                <EditableField
                  isEditing={false}
                  value={item.farmerCity ?? ""}
                  placeholder="City"
                />
              </Field>
              <Field label="Farmer State">
                <EditableField
                  isEditing={false}
                  value={item.farmerState ?? ""}
                  placeholder="State"
                />
              </Field>
              <Field label="Purchase Price ($/lb)">
                <EditableField
                  isEditing={false}
                  value={item.purchasePrice != null ? String(item.purchasePrice) : ""}
                  placeholder="Price"
                />
              </Field>
              <Field label="Shear Date">
                <EditableField
                  isEditing={false}
                  value={item.shearDate ?? ""}
                  placeholder="MM/DD/YYYY"
                />
              </Field>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}