import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";
import { Button } from "./Button";
import { NumberDisplay } from "./Typography";

export default function CardExamples() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Score</CardTitle>
          <CardDescription>Based on your last session.</CardDescription>
        </CardHeader>
        <CardContent>
          <NumberDisplay size="lg">84</NumberDisplay>
        </CardContent>
        <CardFooter>
          <Button>Continue Practice</Button>
        </CardFooter>
      </Card>

      <Card loading>
        <CardHeader>
          <CardTitle>Loading</CardTitle>
        </CardHeader>
      </Card>

      <Card disabled>
        <CardHeader>
          <CardTitle>Chapter 3</CardTitle>
          <CardDescription>Locked — finish Chapter 2 first.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
