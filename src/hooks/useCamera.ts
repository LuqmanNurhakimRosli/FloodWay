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
    
    // Use a ref to keep the stream stable and avoid dependency loops
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setState({ stream: null, isActive: false, error: null });
    }, []);

    const startCamera = useCallback(async (video: HTMLVideoElement | null) => {
        if (!video) return;
        videoRef.current = video;

        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const constraintOptions = [
            { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
            { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
            { video: true, audio: false },
        ];

        let stream: MediaStream | null = null;
        let lastError: string | null = null;

        for (const constraints of constraintOptions) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                break; 
            } catch (err) {
                lastError = (err as Error).message;
                continue;
            }
        }

        if (!stream) {
            setState({ stream: null, isActive: false, error: lastError || 'Could not access camera.' });
            return;
        }

        try {
            streamRef.current = stream;
            video.srcObject = stream;

            // Wait for metadata
            await new Promise<void>((resolve) => {
                if (video.readyState >= 1) {
                    resolve();
                    return;
                }
                video.onloadedmetadata = () => resolve();
                setTimeout(resolve, 3000); // Timeout fallback
            });

            await video.play();
            setState({ stream, isActive: true, error: null });
        } catch (err) {
            if (stream) stream.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            setState({ stream: null, isActive: false, error: (err as Error).message });
        }
    }, []);

    const capturePhoto = useCallback((): { blob: Blob | null; dataURL: string | null } => {
        const video = videoRef.current;
        const stream = streamRef.current;
        if (!video || !stream || !stream.active) return { blob: null, dataURL: null };

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL('image/jpeg', 0.85);

        // Convert to Blob
        try {
            const byteString = atob(dataURL.split(',')[1]);
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            const blob = new Blob([ab], { type: mimeString });
            return { blob, dataURL };
        } catch (e) {
            return { blob: null, dataURL };
        }
    }, []);

    return { ...state, startCamera, capturePhoto, stopCamera };
}

