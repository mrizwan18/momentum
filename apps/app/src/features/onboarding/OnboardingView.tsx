"use client";

import * as React from "react";
import { Crossfade } from "@momentum/ui";
import { useStorage } from "@/providers/storage-provider";
import { useOnboardingFlow } from "./hooks/use-onboarding-flow";
import { useBaselineRecording } from "./hooks/use-baseline-recording";
import { saveBaselineRecording } from "./services/baseline-service";
import { SplashScreen } from "./components/SplashScreen";
import { IntroPowerfulPractice } from "./components/IntroPowerfulPractice";
import { IntroAICoach } from "./components/IntroAICoach";
import { IntroProgress } from "./components/IntroProgress";
import { IntroGetToKnowYou } from "./components/IntroGetToKnowYou";
import { NameAgeForm } from "./components/NameAgeForm";
import { CaptureVoiceIntro } from "./components/CaptureVoiceIntro";
import { RecordingReadyScreen } from "./components/RecordingReadyScreen";
import { RecordingScreen } from "./components/RecordingScreen";
import { UploadingScreen } from "./components/UploadingScreen";
import { AnalyzingScreen } from "./components/AnalyzingScreen";
import { InitialAssessmentScreen } from "./components/InitialAssessmentScreen";

/**
 * Orchestrates every onboarding screen from useOnboardingFlow's step — the
 * same "hook owns state, view only renders per-status" split used by
 * DashboardView/PracticeView. The voice-intro capture (captureIntro ->
 * recordingReady -> recording) is owned by its own useBaselineRecording
 * instance here, so both the Ready and Recording screens share one live
 * mic session instead of racing two independent ones.
 */
export function OnboardingView() {
  const { step, next, back } = useOnboardingFlow();
  const storage = useStorage();
  const recording = useBaselineRecording();
  const savedRef = React.useRef(false);

  // Once a take is captured — via the manual stop button or the 15s
  // auto-stop — save it as the baseline and move on to the upload
  // animation. Effect-driven (rather than only the Stop button's onClick)
  // so the auto-stop path advances the flow too.
  React.useEffect(() => {
    if (
      step !== "recording" ||
      recording.status !== "stopped" ||
      !recording.blob
    ) {
      return;
    }
    if (savedRef.current) return;
    savedRef.current = true;
    saveBaselineRecording(storage, {
      blob: recording.blob,
      durationMs: recording.durationMs,
    })
      .then(next)
      .catch(next);
  }, [
    step,
    recording.status,
    recording.blob,
    recording.durationMs,
    storage,
    next,
  ]);

  React.useEffect(() => {
    if (step !== "recording") {
      savedRef.current = false;
    }
  }, [step]);

  return (
    <Crossfade activeKey={step}>
      {step === "splash" ? <SplashScreen onComplete={next} /> : null}
      {step === "intro1" ? <IntroPowerfulPractice onNext={next} /> : null}
      {step === "intro2" ? <IntroAICoach onNext={next} /> : null}
      {step === "intro3" ? <IntroProgress onNext={next} /> : null}
      {step === "intro4" ? <IntroGetToKnowYou onNext={next} /> : null}
      {step === "form" ? <NameAgeForm onBack={back} onNext={next} /> : null}

      {step === "captureIntro" ? (
        <CaptureVoiceIntro onBack={back} onNext={next} />
      ) : null}

      {step === "recordingReady" ? (
        <RecordingReadyScreen
          onBack={back}
          onStartRecording={async () => {
            const started = await recording.requestAndStart();
            if (started) next();
            return started;
          }}
          permissionDenied={recording.status === "permission-denied"}
        />
      ) : null}

      {step === "recording" ? (
        <RecordingScreen
          onCancel={() => {
            recording.discard();
            back();
          }}
          onStop={() => {
            void recording.stop();
          }}
          elapsedMs={recording.elapsedMs}
          levels={recording.levels}
        />
      ) : null}

      {step === "uploading" ? (
        <UploadingScreen onBack={back} onComplete={next} />
      ) : null}
      {step === "analyzing" ? (
        <AnalyzingScreen onBack={back} onComplete={next} />
      ) : null}
      {step === "result" ? (
        <InitialAssessmentScreen
          onBack={back}
          onNext={() => {
            // Marks onboarding finished before the final `next()` navigates
            // to "/" — the Dashboard's own gate checks this same flag, so
            // it must be durable before that redirect lands.
            storage.users.completeOnboarding().finally(next);
          }}
        />
      ) : null}
    </Crossfade>
  );
}
