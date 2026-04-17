"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getItemById, Item } from "@/api/items";
import EditableField from "@/components/ui/EditableField";

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

function ImageSlot({ src, iconClass }: { src?: string; iconClass?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ImageIcon className={iconClass ?? "w-16 h-16 text-gray-300"} />;
  }

  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function ViewForm() {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: itemId } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getItemById(itemId);
        setItem(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const BackLink = () => (
    <Link
      href="/inventory"
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
    >
      ← Back to Inventory
    </Link>
  );

  if (loading)
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <BackLink />
        </div>
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <BackLink />
        </div>
        <h1 className="text-4xl font-bold text-red-600">{error}</h1>
      </main>
    );

  if (!item)
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <BackLink />
        </div>
        <h1 className="text-4xl font-bold">Item not found</h1>
      </main>
    );

  const i = item as any;
  const images: string[] = i.images ?? [];

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <BackLink />
        <div className="hidden md:flex gap-2">
          <button className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50">
            Print Label
          </button>
          <button className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700">
            Publish
          </button>
        </div>
      </div>

      <h1 className="text-lg font-bold mb-4 md:hidden">
        SKU: {i.sku ?? i._id ?? itemId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 md:gap-10">
        <div className="hidden md:flex flex-col gap-4">
          <div className="w-full aspect-square rounded-lg border border-gray-200 flex items-center justify-center bg-white overflow-hidden">
            <ImageSlot src={images[0]} iconClass="w-16 h-16 text-gray-300" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="aspect-square rounded-md border border-gray-200 flex items-center justify-center bg-white overflow-hidden"
              >
                <ImageSlot
                  src={images[idx]}
                  iconClass="w-6 h-6 text-gray-300"
                />
              </div>
            ))}
          </div>

          <Field label="Notes">
            <EditableField
              isEditing={false}
              value={i.notes ?? ""}
              placeholder="Notes"
              multiline
            />
          </Field>
        </div>

        <div className="flex flex-col gap-6 md:gap-10">
          <section>
            <h2 className="text-xl font-bold mb-4 md:mb-5">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-5">
              <Field label="Breed">
                <EditableField
                  isEditing={false}
                  value={i.breed ?? ""}
                  placeholder="Breed"
                />
              </Field>
              <Field label="Grade">
                <EditableField
                  isEditing={false}
                  value={i.grade ?? ""}
                  placeholder="Grade"
                />
              </Field>
              <Field label="Color">
                <EditableField
                  isEditing={false}
                  value={i.color ?? ""}
                  placeholder="Color"
                />
              </Field>
              <Field label="Weight (lb)">
                <EditableField
                  isEditing={false}
                  value={i.weight ?? ""}
                  placeholder="Weight"
                />
              </Field>
              <Field label="Pallet Location">
                <EditableField
                  isEditing={false}
                  value={i.location ?? ""}
                  placeholder="Pallet Number"
                />
              </Field>
              <Field label="Status">
                <EditableField
                  isEditing={false}
                  value={i.status ?? ""}
                  placeholder="Status"
                />
              </Field>
            </div>
          </section>

          <div className="md:hidden">
            <Field label="Notes">
              <EditableField
                isEditing={false}
                value={i.notes ?? ""}
                placeholder="Notes"
                multiline
              />
            </Field>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-4 md:mb-5">Purchase Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-5">
              <Field label="Farmer Name">
                <EditableField
                  isEditing={false}
                  value={i.farmerName ?? ""}
                  placeholder="Name"
                />
              </Field>
              <Field label="Farmer Contact">
                <EditableField
                  isEditing={false}
                  value={i.farmerContact ?? ""}
                  placeholder="Phone number or email"
                />
              </Field>
              <Field label="Farmer City">
                <EditableField
                  isEditing={false}
                  value={i.farmerCity ?? ""}
                  placeholder="City"
                />
              </Field>
              <Field label="Farmer State">
                <EditableField
                  isEditing={false}
                  value={i.farmerState ?? ""}
                  placeholder="State"
                />
              </Field>
              <Field label="Purchase Price ($/lb)">
                <EditableField
                  isEditing={false}
                  value={i.purchasePrice ?? ""}
                  placeholder="Price"
                />
              </Field>
              <Field label="Shear Date">
                <EditableField
                  isEditing={false}
                  value={i.shearDate ?? ""}
                  placeholder="MM/DD/YYYY"
                />
              </Field>
            </div>
          </section>

          <div className="md:hidden">
            <h2 className="text-sm text-gray-600 mb-2">Photos</h2>
            <div className="flex gap-2 overflow-x-auto">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="w-16 h-16 flex-shrink-0 rounded-md border border-gray-200 flex items-center justify-center bg-white overflow-hidden"
                >
                  <ImageSlot
                    src={images[idx]}
                    iconClass="w-6 h-6 text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <button className="w-full rounded px-4 py-2.5 text-sm text-white hover:bg-gray-700 bg-[#9F9E97]">
              Publish
            </button>
            <button className="w-full rounded border px-4 py-2.5 text-sm text-white text-white bg-[#2C2C2C] hover:bg-[#1A1A1A]">
              Save
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}