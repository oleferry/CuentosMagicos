import Link from "next/link";
import FondoCuadricula from "@/components/ui/FondoCuadricula";
import { LIMITES } from "@/lib/servidor/acceso";

const DEGRADADO = "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)";

const PASOS = [
  {
    emoji: "🧒",
    titulo: "Personaliza",
    texto: "Edad, protagonista, acompañantes, lugar y lo que quieres que aprenda.",
    color: "#9B5DE5",
  },
  {
    emoji: "🪄",
    titulo: "Se crea la magia",
    texto: "Un cuento con datos reales y una ilustración para cada escena.",
    color: "#FF6B9D",
  },
  {
    emoji: "📖",
    titulo: "Leed o imprimid",
    texto: "En letra ligada para aprender a leer, o descárgalo en PDF.",
    color: "#00BBF9",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* Hero (adaptado de 21st.dev) */}
      <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden px-4 py-16">
        <FondoCuadricula />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <Link
            href="/crear"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#E8E0F0] bg-white px-4 py-1.5 text-xs font-bold text-[#9B5DE5] shadow-sm transition-colors hover:border-[#9B5DE5]"
          >
            ✏️ Nuevo: modo «Aprender a leer» en letra ligada →
          </Link>

          <h1 className="mx-auto mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[#3a2c4d] sm:text-5xl md:text-6xl">
            Cuentos mágicos con{" "}
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF6B9D] to-[#9B5DE5] bg-clip-text text-transparent">
              tu hijo de protagonista
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[#7a6b8a] md:text-xl">
            Elige la edad, el lugar y el tema. En segundos tienes un cuento
            ilustrado que enseña algo de verdad, listo para leer juntos o
            imprimir.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/crear"
              className="w-full rounded-full px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#FF6B35]/25 transition-transform hover:-translate-y-0.5 sm:w-auto"
              style={{ background: DEGRADADO }}
            >
              ✨ Crear un cuento gratis
            </Link>
            <a
              href="#como-funciona"
              className="w-full rounded-full border-2 border-[#E8E0F0] bg-white px-8 py-3.5 text-base font-extrabold text-[#9B5DE5] transition-colors hover:border-[#9B5DE5] sm:w-auto"
            >
              Cómo funciona
            </a>
          </div>

          <p className="mt-4 text-xs font-semibold text-[#7a6b8a]">
            {LIMITES.anonimo} cuentos gratis sin registrarte · luego{" "}
            {LIMITES.email} al mes dejando tu email
          </p>
          <p className="mt-2 text-xs">
            <Link href="/mis-cuentos" className="font-bold text-[#9B5DE5] underline">
              📚 Ver mis cuentos guardados
            </Link>
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="text-center text-2xl font-extrabold text-[#3a2c4d] md:text-3xl">
          Así de fácil
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <div
              key={p.titulo}
              className="rounded-3xl border-t-8 bg-white p-6 shadow-sm"
              style={{ borderTopColor: p.color }}
            >
              <div className="text-3xl">{p.emoji}</div>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wide" style={{ color: p.color }}>
                Paso {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-[#3a2c4d]">{p.titulo}</h3>
              <p className="mt-2 text-sm text-[#7a6b8a]">{p.texto}</p>
            </div>
          ))}
        </div>

        {/* Muestra de letra ligada */}
        <div className="mt-10 rounded-3xl border-2 border-[#FFD93D] bg-[#FFF9E6] p-6 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#FF6B35]">
            Modo aprender a leer
          </p>
          <p className="mt-3 font-ligada text-2xl leading-[2.2] text-[#3a2c4d]">
            Lucía ve un dragón.
            <br />
            El dragón es verde.
            <br />
            ¡Los dos vuelan al sol!
          </p>
          <p className="mt-3 text-sm text-[#7a6b8a]">
            Frases cortas y palabras sencillas en la misma letra ligada que
            aprenden en el cole.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/crear"
            className="inline-block rounded-full px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-[#FF6B35]/25 transition-transform hover:-translate-y-0.5"
            style={{ background: DEGRADADO }}
          >
            ✨ Empezar ahora
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#F0E6DA] px-4 py-6 text-center text-xs text-[#7a6b8a]">
        <Link href="/mis-cuentos" className="font-bold hover:text-[#9B5DE5]">
          Mis cuentos
        </Link>
        <span className="mx-2">·</span>
        <Link href="/en-que-nos-basamos" className="font-bold hover:text-[#9B5DE5]">
          En qué nos basamos
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacidad" className="font-bold hover:text-[#9B5DE5]">
          Privacidad
        </Link>
        <span className="mx-2">·</span>
        <Link href="/familia" className="font-bold hover:text-[#9B5DE5]">
          Acceso familia
        </Link>
      </footer>
    </div>
  );
}
