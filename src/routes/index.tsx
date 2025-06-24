import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Добро пожаловать!</h1>
      <Link href="/product">Перейти к товарам</Link>
    </div>
  );
});
