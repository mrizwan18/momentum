import { Card, CardContent } from "./Card";
import { PageHeader, PageShell } from "./PageShell";
import { Stack } from "./Stack";
import { Text } from "./Typography";

export default function PageShellExamples() {
  return (
    <Stack gap="lg">
      <div className="rounded-xl border border-border">
        <PageShell withBottomNav={false} className="pt-4">
          <PageHeader
            title="Progress"
            description="Your growth over the last 90 days"
          />
          <Card>
            <CardContent className="pt-6">
              <Text>Page content goes here.</Text>
            </CardContent>
          </Card>
        </PageShell>
      </div>

      <div className="rounded-xl border border-border">
        <PageShell withBottomNav={false} className="pt-4">
          <PageHeader title="Loading…" loading />
        </PageShell>
      </div>
    </Stack>
  );
}
