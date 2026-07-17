import type { Metadata } from "next";
import { Heading } from "@momentum/ui";
import ButtonExamples from "@momentum/ui/examples/Button";
import InputExamples from "@momentum/ui/examples/Input";
import SkeletonExamples from "@momentum/ui/examples/Skeleton";
import TypographyExamples from "@momentum/ui/examples/Typography";
import StackExamples from "@momentum/ui/examples/Stack";
import ThemeToggleExamples from "@momentum/ui/examples/ThemeToggle";
import CardExamples from "@momentum/ui/examples/Card";
import DialogExamples from "@momentum/ui/examples/Dialog";
import ProgressRingExamples from "@momentum/ui/examples/ProgressRing";
import BottomNavExamples from "@momentum/ui/examples/BottomNav";
import PageShellExamples from "@momentum/ui/examples/PageShell";
import EmptyStateExamples from "@momentum/ui/examples/EmptyState";
import ToastExamples from "@momentum/ui/examples/Toast";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

const sections: Array<{ title: string; Component: React.ComponentType }> = [
  { title: "Typography", Component: TypographyExamples },
  { title: "Spacing (Stack / Cluster)", Component: StackExamples },
  { title: "Theme Toggle", Component: ThemeToggleExamples },
  { title: "Buttons", Component: ButtonExamples },
  { title: "Inputs", Component: InputExamples },
  { title: "Cards", Component: CardExamples },
  { title: "Dialogs", Component: DialogExamples },
  { title: "Progress Ring", Component: ProgressRingExamples },
  { title: "Bottom Navigation", Component: BottomNavExamples },
  { title: "Page Layout", Component: PageShellExamples },
  { title: "Loading Skeletons", Component: SkeletonExamples },
  { title: "Empty & Error States", Component: EmptyStateExamples },
  { title: "Toast", Component: ToastExamples },
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-10 sm:px-6">
      <Heading as="h1" size="xl">
        Momentum Design System
      </Heading>

      {sections.map(({ title, Component }) => (
        <section key={title} className="flex flex-col gap-4">
          <Heading as="h2" size="md">
            {title}
          </Heading>
          <Component />
        </section>
      ))}
    </main>
  );
}
