import {
  component$,
  useSignal,
  $,
  noSerialize,
  type NoSerialize,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { supabase } from "~/lib/supabase";

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default component$(() => {
  const nav = useNavigate();

  const name = useSignal("");
  const description = useSignal("");
  const imageFile = useSignal<NoSerialize<File> | null>(null);
  const loading = useSignal(false);
  const error = useSignal("");

  const handleInputChange = (signal: typeof name | typeof description) =>
    $((e: Event) => {
      signal.value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    });

  const onFileChange = $((e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0] || null;
    imageFile.value = file ? noSerialize(file) : null;
  });

  const onSubmit = $(async (e: Event) => {
    e.preventDefault();
    error.value = "";
    loading.value = true;

    try {
      let imageUrl = "";

      if (imageFile.value) {
        const ext = imageFile.value.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile.value);

        if (uploadError)
          throw new Error("Ошибка загрузки: " + uploadError.message);

        imageUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName).data.publicUrl;
      }

      let baseSlug = generateSlug(name.value);
      let slug = baseSlug;
      let count = 1;

      while (true) {
        const { data, error: slugError } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (slugError) throw new Error("Проверка slug: " + slugError.message);
        if (!data) break;

        slug = `${baseSlug}-${count++}`;
      }

      const { error: insertError } = await supabase.from("products").insert([
        {
          name: name.value,
          slug,
          description: description.value,
          image_url: imageUrl,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      nav("/product");
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Добавить новый товар</h1>
      <form preventdefault:submit onSubmit$={onSubmit}>
        <div>
          <label>
            Название:
            <input
              type="text"
              value={name.value}
              onInput$={handleInputChange(name)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Описание:
            <textarea
              value={description.value}
              onInput$={handleInputChange(description)}
            />
          </label>
        </div>

        <div>
          <label>
            Картинка:
            <input type="file" accept="image/*" onChange$={onFileChange} />
          </label>
        </div>

        {error.value && <p style={{ color: "red" }}>Ошибка: {error.value}</p>}
        <button type="submit" disabled={loading.value}>
          {loading.value ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
});
