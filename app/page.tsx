import { redirect } from "next/navigation";

// La página de inicio explicativa llegará en la fase 2; por ahora vamos al wizard.
export default function Home() {
  redirect("/crear");
}
