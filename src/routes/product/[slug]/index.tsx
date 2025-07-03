import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

import { supabase } from "~/lib/supabase";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  currency: string;
}

export default component$(() => {
  const loc = useLocation();
  const slug = loc.params.slug;

  const product = useSignal<Product | null>(null);

  useTask$(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    product.value = data;
  });

  if (!product.value) {
    return <div>Товар не найден</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>{product.value.name}</h1>
      <img
        src={product.value.image_url}
        alt={product.value.name}
        width={200}
        height={200}
      />
      <p>{product.value.description}</p>
      <p>
        Цена: {product.value.price} {product.value.currency}
      </p>
      <h2>QR-код</h2>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://iozckjvzcctwwxzopfoe.supabase.co/${slug}`}
        alt="QR Code"
        width={200}
        height={200}
      />
      <p style={{ fontSize: "12px", color: "#555" }}>
        Отсканируйте, чтобы открыть товар
      </p>
    </div>
  );
});
