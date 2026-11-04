import { useEffect, useRef, useState } from 'react';

export default function FaceCheckModal({ action, onClose, onConfirm }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState('');
  const isCheckIn = action === 'check-in';

  useEffect(() => {
    let active = true;
    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Trình duyệt này không hỗ trợ truy cập camera.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      } catch (cameraError) {
        if (active) setError(`Không thể mở camera: ${cameraError.message}`);
      }
    }

    startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  function captureFace() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      setError('Camera chưa sẵn sàng. Vui lòng thử lại.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    try {
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Không thể chụp ảnh từ camera.');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCaptured(Boolean(canvas.toDataURL('image/jpeg', 0.8)));
      setError('');
    } catch (captureError) {
      setError(captureError.message);
    }
  }

  function confirm() {
    if (!captured) {
      setError('Vui lòng chụp khuôn mặt trước khi xác nhận.');
      return;
    }
    try {
      onConfirm();
    } catch (confirmationError) {
      setError(confirmationError.message);
    }
  }

  return <div className="face-check-backdrop">
    <section className="face-check-modal" role="dialog" aria-modal="true" aria-labelledby="face-check-title">
      <div className="panel-heading-row">
        <h2 id="face-check-title">{isCheckIn ? 'Quét khuôn mặt để Check in' : 'Quét khuôn mặt để Check out'}</h2>
        <button className="text-button" type="button" onClick={onClose}>Đóng</button>
      </div>
      <p>Cho phép camera, nhìn thẳng vào camera và chụp ảnh để xác nhận.</p>
      <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={() => setCameraReady(true)} aria-label="Hình ảnh camera" />
      {captured && <p className="face-check-captured">Đã chụp ảnh xác nhận.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="face-check-actions">
        <button className="button button-secondary" type="button" onClick={captureFace} disabled={!cameraReady}>Chụp khuôn mặt</button>
        <button className="button button-primary" type="button" onClick={confirm} disabled={!captured}>{isCheckIn ? 'Xác nhận Check in' : 'Xác nhận Check out'}</button>
      </div>
      <small>Ảnh chỉ được dùng để xác nhận trong phiên này, không lưu lại. Bản demo chưa xác minh danh tính bằng nhận diện khuôn mặt.</small>
    </section>
  </div>;
}
