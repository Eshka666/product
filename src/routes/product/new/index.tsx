import {
  component$,
  useSignal,
  $,
  noSerialize,
  type NoSerialize,
  useTask$,
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

  const categories = useSignal<any[]>([]);
  const name = useSignal("");
  const currency = useSignal("BYN");
  const price = useSignal("");
  const description = useSignal("");
  const categoryName = useSignal("");
  const imageFile = useSignal<NoSerialize<File> | null>(null);
  const loading = useSignal(false);
  const error = useSignal("");
  const categoryId = useSignal("");

  useTask$(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name");
    if (!error && data) {
      categories.value = data;
    }
  });

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

      const baseSlug = generateSlug(name.value);
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
      let finalCategoryId = categoryId.value;

      if (finalCategoryId === "new" && categoryName.value.trim()) {
        const newSlug = generateSlug(categoryName.value);

        const { data: newCat, error: newCatError } = await supabase
          .from("categories")
          .insert([{ name: categoryName.value.trim(), slug: newSlug }])
          .select("id")
          .single();

        if (newCatError || !newCat) {
          throw new Error("Ошибка при добавлении новой категории");
        }

        finalCategoryId = newCat.id;

        categories.value = [
          ...categories.value,
          { id: newCat.id, name: categoryName.value.trim() },
        ];
      }

      if (!finalCategoryId) {
        throw new Error("Пожалуйста, выбери или создай категорию");
      }

      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert([
          {
            name: name.value,
            slug,
            description: description.value,
            image_url: imageUrl,
            price: parseFloat(price.value),
            currency: currency.value,
            category_id: finalCategoryId,
          },
        ])
        .select("id, slug")
        .single();

      if (insertError) throw new Error(insertError.message);

      if (inserted) {
        nav(`/product/${inserted.slug}/`);
      }
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
            Категория:
            <select
              required
              value={categoryId.value}
              onChange$={(e) =>
                (categoryId.value = (e.target as HTMLSelectElement).value)
              }
            >
              <option value="">Выбери категорию</option>
              {categories.value.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="new">+ Добавить новую категорию</option>
            </select>
          </label>
        </div>

        {categoryId.value === "new" && (
          <div>
            <label>
              Новая категория:
              <input
                type="text"
                value={categoryName.value}
                onInput$={(e) =>
                  (categoryName.value = (e.target as HTMLInputElement).value)
                }
                required
              />
            </label>
          </div>
        )}
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
        <div>
          <label>
            Цена:
            <input
              type="number"
              step="0.01"
              min="0"
              value={price.value}
              onInput$={handleInputChange(price)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Валюта:
            <select
              value={currency.value}
              onChange$={(e) =>
                (currency.value = (e.target as HTMLSelectElement).value)
              }
            >
              <option value="BYN">BYN (белорусские рубли)</option>
              <option value="USD">USD (доллары)</option>
              <option value="EUR">EUR (евро)</option>
            </select>
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
