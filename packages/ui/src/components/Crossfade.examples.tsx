"use client";

import * as React from "react";
import { Button } from "./Button";
import { Crossfade } from "./Crossfade";
import { Stack } from "./Stack";

export default function CrossfadeExamples() {
  const [step, setStep] = React.useState<"one" | "two">("one");

  return (
    <Stack gap="md">
      <Crossfade activeKey={step}>
        {step === "one" ? <p>Step one of two</p> : <p>Step two of two</p>}
      </Crossfade>
      <Button
        variant="secondary"
        onClick={() =>
          setStep((current) => (current === "one" ? "two" : "one"))
        }
      >
        Toggle
      </Button>
    </Stack>
  );
}
