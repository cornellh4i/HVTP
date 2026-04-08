const BASE_URL = process.env.REACT_APP_API_URL;

export const togglePublish = async (id: string): Promise<void> => {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`${BASE_URL}/items/togglePublish/${encodedId}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to toggle item publish status");
  }

  return response.json();
};

export const getPublicItems = async (): Promise<any[]> => {
  const response = await fetch(`${BASE_URL}/items/public/items`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public items");
  }

  return response.json();
};