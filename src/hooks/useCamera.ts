import { useCallback, useRef, useState } from 'react';

interface CameraState {
    stream: MediaStream | null;
    isActive: boolean;
    error: string | null;
}

export function useCamera() {
    const [state, setState] = useState<CameraState>({
        stream: null,
        isActive: false,
        error: null,
    });
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const startCamera = useCallback(async (video: HTMLVideoElement | null) => {
        if (!video) return;
        videoRef.current = video;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            video.srcObject = stream;
            await video.play();
            setState({ stream, isActive: true, error: null });
        } catch (err) {
            setState({ stream: null, isActive: false, error: (err as Error).message });
        }
    }, []);

    const capturePhoto = useCallback((): { blob: Blob | null; dataURL: string | null } => {
        const video = videoRef.current;
        if (!video || !state.isActive) return { blob: null, dataURL: null };

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL('image/jpeg', 0.85);

        // Convert to Blob synchronously for convenience
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mimeString });

        return { blob, dataURL };
    }, [state.isActive]);

    const stopCamera = useCallback(() => {
        state.stream?.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setState({ stream: null, isActive: false, error: null });
    }, [state.stream]);

    return { ...state, startCamera, capturePhoto, stopCamera };
}
