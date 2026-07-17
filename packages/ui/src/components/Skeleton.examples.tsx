import {
  Skeleton,
  SkeletonCircle,
  SkeletonGroup,
  SkeletonText,
} from "./Skeleton";
import { Cluster, Stack } from "./Stack";

export default function SkeletonExamples() {
  return (
    <SkeletonGroup label="Loading example content">
      <Stack gap="md">
        <Cluster gap="md">
          <SkeletonCircle size={48} />
          <Stack gap="xs" className="flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </Stack>
        </Cluster>
        <SkeletonText lines={3} />
      </Stack>
    </SkeletonGroup>
  );
}
