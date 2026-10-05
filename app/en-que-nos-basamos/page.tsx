import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "En qué nos basamos · CuentoMágico",
  description:
    "La investigación sobre cómo aprenden a leer los niños detrás de cada función de CuentoMágico, con sus límites.",
};

// Referencias en orden de aparición (comprobadas por DOI el 5 de octubre de 2026).
const REFERENCIAS = [
  { id: "nrp", texto: "National Reading Panel (2000). Teaching children to read. NICHD.", url: "https://www.nichd.nih.gov/publications/pubs/nrp/smallbook" },
  { id: "ehri", texto: "Ehri, L. C., Nunes, S. R., Stahl, S. A. y Willows, D. M. (2001). Systematic phonics instruction helps students learn to read. Review of Educational Research, 71(3), 393-447.", url: "https://doi.org/10.3102/00346543071003393" },
  { id: "seymour", texto: "Seymour, P. H. K., Aro, M. y Erskine, J. M. (2003). Foundation literacy acquisition in European orthographies. British Journal of Psychology, 94(2), 143-174.", url: "https://doi.org/10.1348/000712603321661859" },
  { id: "caravolas", texto: "Caravolas, M. et al. (2012). Psychological Science, 23(6), 678-686.", url: "https://doi.org/10.1177/0956797611434536" },
  { id: "goikoetxea", texto: "Goikoetxea, E. (2005). Reading and Writing, 18(1), 51-79.", url: "https://doi.org/10.1007/s11145-004-1955-7" },
  { id: "martinez", texto: "Martínez, N. y Goikoetxea, E. (2020). Psicología Educativa, 26(1), 37-48.", url: "https://doi.org/10.5093/psed2019a20" },
  { id: "cheatham", texto: "Cheatham, J. P. y Allor, J. H. (2012). The influence of decodability in early reading text on reading achievement. Reading and Writing, 25(9), 2223-2246.", url: "https://doi.org/10.1007/s11145-011-9355-2" },
  { id: "murphy", texto: "Murphy Odo, D. (2024). The use of decodable texts… a meta-analysis. Literacy, 58(3), 267-277.", url: "https://doi.org/10.1111/lit.12368" },
  { id: "price", texto: "Price-Mohr, R. y Price, C. (2020). Early Childhood Education Journal, 48(1), 39-47.", url: "https://doi.org/10.1007/s10643-019-00970-4" },
  { id: "dfe", texto: "Department for Education (2023). The reading framework. Gobierno del Reino Unido.", url: "https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy" },
  { id: "shanahan", texto: "Shanahan, T. y Lonigan, C. J. (2010). The National Early Literacy Panel: A summary of the process and the report. Educational Researcher, 39(4), 279-285.", url: "https://doi.org/10.3102/0013189X10369172" },
  { id: "piastaw", texto: "Piasta, S. B. y Wagner, R. K. (2010). Reading Research Quarterly, 45(1), 8-38.", url: "https://doi.org/10.1598/RRQ.45.1.2" },
  { id: "evans", texto: "Evans, M. A. y Saint-Aubin, J. (2005). Psychological Science, 16(11), 913-920.", url: "https://doi.org/10.1111/j.1467-9280.2005.01636.x" },
  { id: "piastaj", texto: "Piasta, S. B., Justice, L. M., McGinty, A. S. y Kaderavek, J. N. (2012). Child Development, 83(3), 810-820.", url: "https://doi.org/10.1111/j.1467-8624.2012.01754.x" },
  { id: "sunde", texto: "Sunde, K., Furnes, B. y Lundetræ, K. (2020). Scientific Studies of Reading, 24(2), 141-158.", url: "https://doi.org/10.1080/10888438.2019.1615491" },
  { id: "bothdevries", texto: "Both-de Vries, A. C. y Bus, A. G. (2010). Reading and Writing, 23(2), 173-187.", url: "https://doi.org/10.1007/s11145-008-9158-2" },
  { id: "longcamp", texto: "Longcamp, M., Zerbato-Poudou, M.-T. y Velay, J.-L. (2005). Acta Psychologica, 119(1), 67-79.", url: "https://doi.org/10.1016/j.actpsy.2004.10.019" },
  { id: "mayer", texto: "Mayer, C. et al. (2020). Frontiers in Psychology, 10, 3054.", url: "https://doi.org/10.3389/fpsyg.2019.03054" },
  { id: "james", texto: "James, K. H. y Engelhardt, L. (2012). Trends in Neuroscience and Education, 1(1), 32-42.", url: "https://doi.org/10.1016/j.tine.2012.08.001" },
  { id: "santangelo", texto: "Santangelo, T. y Graham, S. (2016). A comprehensive meta-analysis of handwriting instruction. Educational Psychology Review, 28(2), 225-265.", url: "https://doi.org/10.1007/s10648-015-9335-1" },
  { id: "puranik", texto: "Puranik, C. S. y Lonigan, C. J. (2012). Early Childhood Research Quarterly, 27(2), 284-294.", url: "https://doi.org/10.1016/j.ecresq.2011.09.003" },
  { id: "semeraro", texto: "Semeraro, C., Coppola, G., Cassibba, R. y Lucangeli, D. (2019). PLOS ONE, 14(2), e0209978.", url: "https://doi.org/10.1371/journal.pone.0209978" },
  { id: "bara13", texto: "Bara, F. y Morin, M.-F. (2013). Psychology in the Schools, 50(6), 601-617.", url: "https://doi.org/10.1002/pits.21691" },
  { id: "bara16", texto: "Bara, F., Morin, M.-F., Alamargot, D. y Bosse, M.-L. (2016). Learning and Individual Differences, 45, 88-94.", url: "https://doi.org/10.1016/j.lindif.2015.11.020" },
  { id: "whitehurst", texto: "Whitehurst, G. J. et al. (1988). Developmental Psychology, 24(4), 552-559.", url: "https://doi.org/10.1037/0012-1649.24.4.552" },
  { id: "mol", texto: "Mol, S. E., Bus, A. G., de Jong, M. T. y Smeets, D. J. H. (2008). Early Education and Development, 19(1), 7-26.", url: "https://doi.org/10.1080/10409280701838603" },
  { id: "dowdall", texto: "Dowdall, N. et al. (2020). Child Development, 91(2), e383-e399.", url: "https://doi.org/10.1111/cdev.13225" },
  { id: "valdez", texto: "Valdez-Menchaca, M. C. y Whitehurst, G. J. (1992). Developmental Psychology, 28(6), 1106-1114.", url: "https://doi.org/10.1037/0012-1649.28.6.1106" },
  { id: "vankleeck06", texto: "van Kleeck, A., Vander Woude, J. y Hammett, L. (2006). American Journal of Speech-Language Pathology, 15(1), 85-95.", url: "https://doi.org/10.1044/1058-0360(2006/009)" },
  { id: "vankleeck08", texto: "van Kleeck, A. (2008). Psychology in the Schools, 45(7), 627-643.", url: "https://doi.org/10.1002/pits.20314" },
  { id: "blewitt", texto: "Blewitt, P., Rump, K. M., Shealy, S. E. y Cook, S. A. (2009). Journal of Educational Psychology, 101(2), 294-304.", url: "https://doi.org/10.1037/a0013844" },
  { id: "noble", texto: "Noble, C. et al. (2019). Educational Research Review, 28, 100290.", url: "https://doi.org/10.1016/j.edurev.2019.100290" },
  { id: "kucirkova14", texto: "Kucirkova, N., Messer, D. y Sheehy, K. (2014). First Language, 34(3), 227-243.", url: "https://doi.org/10.1177/0142723714534221" },
  { id: "kucirkova12", texto: "Kucirkova, N., Messer, D. y Whitelock, D. (2012). Journal of Early Childhood Literacy.", url: "https://doi.org/10.1177/1468798412438068" },
  { id: "kucirkova24", texto: "Kucirkova, N. y Ciesielska, M. (2024). Reading Psychology.", url: "https://doi.org/10.1080/02702711.2024.2405483" },
  { id: "takacs", texto: "Takacs, Z. K., Swart, E. K. y Bus, A. G. (2015). Review of Educational Research, 85(4), 698-739.", url: "https://doi.org/10.3102/0034654314566989" },
  { id: "hughes", texto: "Hughes, L. E. y Wilkins, A. J. (2000). Journal of Research in Reading, 23(3), 314-324.", url: "https://doi.org/10.1111/1467-9817.00126" },
  { id: "wilkins", texto: "Wilkins, A., Cleave, R., Grayson, N. y Wilson, L. (2009). Journal of Research in Reading, 32(4), 402-412.", url: "https://doi.org/10.1111/j.1467-9817.2009.01402.x" },
  { id: "perea", texto: "Perea, M., Panadero, V., Moret-Tatay, C. y Gómez, P. (2012). Learning and Instruction, 22(6), 420-430.", url: "https://doi.org/10.1016/j.learninstruc.2012.04.001" },
];

const NUMERO = new Map(REFERENCIAS.map((r, i) => [r.id, i + 1]));

// Llamada a referencias: [1, 2]
function C({ r }: { r: string }) {
  const ids = r.split(" ");
  return (
    <sup className="ml-0.5 text-[0.7em] font-bold text-[#9B5DE5]">
      [
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ", "}
          <a href={`#ref-${NUMERO.get(id)}`} className="hover:underline">
            {NUMERO.get(id)}
          </a>
        </span>
      ))}
      ]
    </sup>
  );
}

function Bloque({
  emoji,
  titulo,
  children,
  limites,
}: {
  emoji: string;
  titulo: string;
  children: React.ReactNode;
  limites: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold text-[#3a2c4d]">
        <span className="mr-2">{emoji}</span>
        {titulo}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-[#5a4a6a]">{children}</div>
      <p className="mt-3 rounded-xl bg-[#FFF9E6] px-3 py-2 text-xs leading-relaxed text-[#6b5a3a]">
        <strong>Lo que no prometemos:</strong> {limites}
      </p>
    </section>
  );
}

export default function EnQueNosBasamosPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header
        className="px-4 py-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)" }}
      >
        <Link href="/" className="text-2xl font-extrabold drop-shadow-sm">
          ✨ CuentoMágico
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <article className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-extrabold text-[#3a2c4d]">En qué nos basamos</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#5a4a6a]">
            Queremos que leer con CuentoMágico sea un rato bonito en familia, y que cada detalle
            tenga un porqué. Esto es lo que dice la investigación sobre cómo aprenden a leer los
            niños, cómo lo aplicamos y, también, hasta dónde llega.
          </p>

          <Bloque
            emoji="🌱"
            titulo="Cuentos que puede leer de verdad"
            limites={
              <>
                los textos con letras controladas ayudan sobre todo a leer con precisión y su
                efecto es pequeño <C r="cheatham murphy" />. No sustituyen al cole ni a leerle
                en voz alta cuentos más ricos.
              </>
            }
          >
            <p>
              Aprender de forma ordenada qué sonido tiene cada letra y cómo se unen es una de las
              formas mejor estudiadas de enseñar a leer, sobre todo si se empieza pronto
              <C r="nrp ehri" />. El español se lee casi como se escribe, y la mayoría de los
              niños descifran palabras con soltura durante su primer curso <C r="seymour caravolas" />.
            </p>
            <p>
              Por eso cada nivel usa solo las letras que tu hijo ya conoce: primero sílabas
              directas como <em>ma</em> o <em>lo</em>, y después las trabadas (<em>bra</em>,{" "}
              <em>cla</em>) y los grupos como <em>que</em> o <em>gue</em>, que los estudios con
              niños hispanohablantes señalan como más difíciles <C r="goikoetxea martinez" />.
              Como la IA no siempre cumple estas reglas, un programa revisa cada cuento palabra
              por palabra y, si encuentra más de tres palabras de un nivel superior, le pide que
              las cambie.
              Aun así, cuidamos que la historia tenga sentido y suene natural, porque los textos
              forzados se entienden peor <C r="cheatham price" />. Releer el mismo cuento otro día
              también ayuda a ganar soltura <C r="dfe" />.
            </p>
          </Bloque>

          <Bloque
            emoji="🔤"
            titulo="Una letra protagonista"
            limites={
              <>
                reconocer letras no basta por sí solo: lo que hace avanzar es unir sus sonidos al
                leer <C r="piastaw" />. Tampoco hay una cifra demostrada de cuántas veces debe
                aparecer.
              </>
            }
          >
            <p>
              Conocer las letras y sus sonidos es uno de los mejores predictores de cómo leerá un
              niño más adelante, también en español <C r="shanahan caravolas" />. Cuando les
              leemos, los niños apenas miran el texto <C r="evans" />; señalar las letras y
              hablar de ellas durante la lectura mejora la lectura y la escritura incluso años
              después <C r="piastaj" />.
            </p>
            <p>
              Por eso puedes elegir una letra para cada cuento: aparece muchas veces, a menudo al
              principio de las palabras, y al final os proponemos buscarla juntos y decir cómo
              suena. Las demás letras del nivel siguen apareciendo para repasarlas: avanzar a
              buen ritmo y repasar funciona mejor que quedarse una semana en cada letra{" "}
              <C r="sunde" />.
            </p>
          </Bloque>

          <Bloque
            emoji="✏️"
            titulo="La ficha para escribir a mano"
            limites={
              <>
                los estudios no se ponen de acuerdo sobre si es mejor la letra ligada o la de
                imprenta <C r="semeraro bara13 bara16" />. Y una ficha en casa no sustituye a la
                enseñanza de la escritura en el cole <C r="santangelo" />.
              </>
            }
          >
            <p>
              Escribir letras a mano, más que teclearlas o solo mirarlas, ayuda a reconocerlas
              <C r="longcamp mayer" />. Repasar el trazo está bien para empezar, pero lo que más
              ayuda es copiar y después escribir sin modelo <C r="james" />. Por eso cada palabra
              tiene un modelo para copiar, otras en gris para repasar y un renglón vacío para
              escribirla sola.
            </p>
            <p>
              Empezamos por su nombre, porque suele ser la puerta de entrada a las primeras letras
              <C r="bothdevries puranik" />. Usamos la letra ligada de muchos colegios españoles,
              pero puedes cambiar a imprenta: lo importante es que coincida con la de su cole.
              Cuando la ficha está en ligada, también mostramos la letra de hoy tal como la verá
              en los libros <C r="bara16" />.
            </p>
          </Bloque>

          <Bloque
            emoji="💬"
            titulo="Preguntas para conversar"
            limites={
              <>
                los efectos son modestos, mayores en el vocabulario y la expresión oral que en la
                lectura, y dependen de esa charla entre vosotros <C r="dowdall noble" />.
              </>
            }
          >
            <p>
              Hacer preguntas mientras se lee y animar al niño a contar la historia mejora su
              vocabulario y su forma de expresarse <C r="whitehurst mol dowdall" />, también en
              niños hispanohablantes <C r="valdez" />.
            </p>
            <p>
              Por eso cada cuento termina con 4 preguntas, de más fácil a más difícil: qué pasó,
              por qué pasó, cómo se sentía un personaje y si a él le ha pasado algo parecido
              <C r="vankleeck06 vankleeck08 blewitt" />. A mitad del cuento os proponemos una
              pausa para imaginar qué pasará. Y os damos una mini-guía: esperar su respuesta,
              felicitarle y añadir algo a lo que dice. Es una conversación, no un examen.
            </p>
          </Bloque>

          <Bloque
            emoji="⭐"
            titulo="Tu hijo, protagonista"
            limites={
              <>
                son estudios todavía pequeños y con niños más pequeños; no hay pruebas de que la
                personalización mejore la lectura a estas edades.
              </>
            }
          >
            <p>
              Los primeros estudios sugieren que los cuentos personalizados despiertan más interés
              y ayudan a recordar las palabras nuevas <C r="kucirkova14 kucirkova12" />. Por eso
              la personalización está al servicio de la historia, con otros personajes y mundos
              <C r="kucirkova24" />, y sin juegos ni animaciones que distraigan de leer{" "}
              <C r="takacs" />.
            </p>
          </Bloque>

          <Bloque
            emoji="🔍"
            titulo="Fácil de leer"
            limites={<>no hay estudios sobre leer cuentos enteros en letra ligada; por eso puedes elegir imprenta.</>}
          >
            <p>
              Los primeros lectores leen mejor con letra grande y espaciada <C r="hughes wilkins" />,
              y un poco más de espacio entre letras ayuda a niños españoles a reconocer las
              palabras <C r="perea" />. Por eso los cuentos usan letra grande, interlineado
              amplio y, en imprenta, algo más de espacio entre letras.
            </p>
          </Bloque>

          <p className="mt-8 text-sm font-semibold leading-relaxed text-[#3a2c4d]">
            Ninguna aplicación sustituye a un adulto que lee con su hijo. CuentoMágico quiere ser
            una buena excusa para hacerlo cada día. 💛
          </p>

          <section className="mt-10 border-t border-[#F0E6DA] pt-6">
            <h2 className="text-base font-extrabold text-[#3a2c4d]">Referencias</h2>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-[#5a4a6a]">
              {REFERENCIAS.map((r, i) => (
                <li key={r.id} id={`ref-${i + 1}`} className="scroll-mt-4">
                  <span className="font-bold">{i + 1}.</span> {r.texto}{" "}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-semibold text-[#9B5DE5] underline"
                  >
                    {r.url.replace(/^https:\/\//, "")}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </article>

        <p className="mt-6 text-center text-xs">
          <Link href="/" className="font-bold text-[#9B5DE5] underline">
            Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  );
}
