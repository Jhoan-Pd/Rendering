export default function NoEncontrada() {
  return (
    <section className="encabezado-seccion">
      <h1>No encontramos esa página</h1>
      <p>
        Puede que la noticia no exista o que se trate de una nota de archivo que no se generó en el build.{" "}
        <a href="/">Volver a la portada</a>
      </p>
    </section>
  );
}
