import { useStore } from '@/app/useStore';
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
  useViewModel,
  useViewModelInstanceNumber,
  useViewModelInstance,
  EventType,
} from '@rive-app/react-webgl2';
import { useEffect, useState } from 'react';

export function WorksSocials({ progressValue, behance, className, onBack }: { progressValue: number, behance?: string | null, className?: string, onBack?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { setOpenContact } = useStore();

  const { rive, setCanvasRef, setContainerRef } = useRive({
    src: behance ? "/works_rive.riv" : "/works_rive_nobehance.riv",
    artboard: "Artboard",
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const viewModel = useViewModel(rive, { name: "FooterViewModel" });
  const vmi = useViewModelInstance(viewModel, { rive });
  const { value: progress, setValue: setProgress } = useViewModelInstanceNumber(
    "progress",
    vmi
  );

  useEffect(() => {
    if (rive) {
      const safeOpen = (url: string) => {
        const newWindow = window.open(url, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          window.location.href = url;
        }
      };

      const onRiveEvent = (event: any) => {
        console.log(event.data.name)
        if (event.data.name === "backClicked") {
          if (onBack) {
            onBack();
          } else {
            window.history.back();
          }
        }

        if (event.data.name === "behanceClicked") {
          if (behance) {
            safeOpen(behance);
          }
        }

        if (event.data.name === "messageClicked") {
          setOpenContact(true);
        }
      };



      rive.on(EventType.RiveEvent, onRiveEvent);
      return () => {
        rive.off(EventType.RiveEvent, onRiveEvent);
      };
    }
  }, [rive, onBack]);

  useEffect(() => {
    setProgress(progressValue);
  }, [rive, setProgress, progressValue]);


  return (
    <div
      className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-[10] ${progressValue == 100 ? "pointer-events-auto" : "pointer-events-none"}`}
      onClick={(e) => e.stopPropagation()}
      ref={setContainerRef}
    >
      <canvas ref={setCanvasRef} />
    </div>
  );
}