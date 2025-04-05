import { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io("http://localhost:4000", { withCredentials: true });

export function useSocket(setMessages, setGallery, setCurrentIndex) {
  useEffect(() => {
    const handleGalleryUpdated = (updatedGallery) => {
      console.log("Received gallery update:", updatedGallery);
      setGallery(updatedGallery);
    };

    const handleUpdateImage = (index) => {
      console.log("Received updateImage event:", index);
      setCurrentIndex(index);
    };

    const handleMessage = (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    };

    socket.on("galleryUpdated", handleGalleryUpdated);
    socket.on("updateImage", handleUpdateImage);
    socket.on("message", handleMessage);

    return () => {
      socket.off("galleryUpdated", handleGalleryUpdated);
      socket.off("updateImage", handleUpdateImage);
      socket.off("message", handleMessage);
    };
  }, [setMessages, setGallery, setCurrentIndex]);

  return socket;
}