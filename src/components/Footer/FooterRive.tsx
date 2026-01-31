import { useStore } from '@/app/useStore';
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  useViewModel,
  useViewModelInstance,
  EventType,
} from '@rive-app/react-webgl2';
import { useEffect } from 'react';

export function FooterRive({ className }: { className?: string }) {

  const setOpenContact = useStore((state) => state.setOpenContact);

  const { rive, setCanvasRef, setContainerRef } = useRive({
    src: '/instafooter.riv',
    artboard: "Artboard",
    stateMachines: 'State Machine 1',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  const viewModel = useViewModel(rive, { name: "FooterViewModel" });
  const vmi = useViewModelInstance(viewModel, { rive });


  useEffect(() => {
    if (rive) {
      const safeOpen = (url: string) => {
        const newWindow = window.open(url, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          window.location.href = url;
        }
      };

      const onRiveEvent = (event: any) => {
        if (event.data.name === "backClicked") {
          safeOpen("https://www.instagram.com/jpegloris_/");
        }
        if (event.data.name === "behanceClicked") {
          safeOpen("https://www.behance.net/bukvitylorisz/");
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
  }, [rive]);

  return (
    <div
      className={className}
      ref={setContainerRef}
    >
      <canvas ref={setCanvasRef} />
    </div>
  );
}