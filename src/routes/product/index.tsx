import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import { supabase } from "~/lib/supabase";

export default component$(() => {
  const products = useSignal<any[]>([]);

  useTask$(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug");
    if (!error && data) {
      products.value = data;
    }
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Список товаров</h1>
      <Link href="/product/new">Добавить новый товар</Link>
      <ul>
        {products.value.map((product) => (
          <li key={product.id}>
            <Link href={`/product/${product.slug}`}>
              {product.name || product.slug}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});
