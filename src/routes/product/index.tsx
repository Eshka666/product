import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { supabase } from "~/lib/supabase";

type Product = {
  id: string;
  name: string;
  slug: string;
  categories: { name: string }[];
};

export default component$(() => {
  const productsByCategory = useSignal<Record<string, Product[]>>({});

  useTask$(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, categories(name)");

    if (error || !data) return;

    const grouped: Record<string, Product[]> = {};

    for (const product of data as Product[]) {
      const categoryName = product.categories?.[0]?.name || "Без категории";

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }

      grouped[categoryName].push(product);
    }

    productsByCategory.value = grouped;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Список товаров</h1>
      <Link href="/product/new">➕ Добавить новый товар</Link>

      {Object.entries(productsByCategory.value).map(([category, products]) => (
        <div key={category} style={{ marginTop: "20px" }}>
          <h2>{category}</h2>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <Link href={`/product/${product.slug}`}>{product.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});
