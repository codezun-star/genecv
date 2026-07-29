import { Container } from "@/components/layout/container";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Crear mi CV",
  description: "Editor de currículum de GeneCV.",
  path: "/crear",
});

export default function CreatePage() {
  return (
    <Container className="py-16">
      <h1 className="text-4xl font-bold">Crear mi CV</h1>
    </Container>
  );
}
