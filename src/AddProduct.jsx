import { useState } from "react";
import { supabase } from "./supabase"; // <-- see note below

// Shrinks the photo before upload (saves data for sellers and customers)
async function compressImage(file, maxWidth = 800) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.8)
  );
}

export default function AddProduct({ onAdded }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Please log in again.");

      let image_url = null;

      if (photo) {
        const blob = await compressImage(photo);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("products").insert({
        shop_id: user.id, // your seller id is the same as the login id
        name,
        price: parseInt(price, 10),
        description,
        image_url,
      });
      if (insertError) throw insertError;

      setName("");
      setPrice("");
      setDescription("");
      setPhoto(null);
      e.target.reset();
      if (onAdded) onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
      <h3>Add a product</h3>

      <input
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Price (XAF)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        min="0"
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add product"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}