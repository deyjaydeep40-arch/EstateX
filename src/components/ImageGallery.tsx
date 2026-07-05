/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Filter out duplicate or empty image URLs
  const uniqueImages = Array.from(new Set(images)).filter(Boolean);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIdx, uniqueImages.length]);

  const handleOpen = (index: number) => {
    setActiveIdx(index);
    setZoomScale(1);
    setIsOpen(true);
    // Disable body scroll when lightbox is active
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setIsOpen(false);
    setZoomScale(1);
    document.body.style.overflow = 'unset';
  };

  const handlePrev = () => {
    setZoomScale(1);
    setActiveIdx((prev) => (prev === 0 ? uniqueImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setZoomScale(1);
    setActiveIdx((prev) => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  if (uniqueImages.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 text-slate-400 text-sm">
        No images available
      </div>
    );
  }

  return (
    <div id="property-image-gallery" className="space-y-4">
      {/* Main Image View */}
      <div className="relative group aspect-video md:h-[450px] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-850 shadow-sm">
        <img
          src={uniqueImages[activeIdx]}
          alt={`${title} - View ${activeIdx + 1}`}
          className="h-full w-full object-cover transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover / tap indicator for Lightbox */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <button
            onClick={() => handleOpen(activeIdx)}
            className="pointer-events-auto flex items-center space-x-2 rounded-full bg-white/90 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          >
            <Maximize2 className="h-4 w-4 text-indigo-600" />
            <span>Expand Gallery</span>
          </button>
        </div>

        {/* Mobile quick expand button */}
        <button
          onClick={() => handleOpen(activeIdx)}
          className="absolute right-4 bottom-4 md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-white/95 text-slate-900 shadow-md backdrop-blur-sm active:scale-90 transition-transform"
          title="Zoom image"
        >
          <Maximize2 className="h-4.5 w-4.5 text-indigo-600" />
        </button>

        {/* Navigation arrows directly on main image (if multiple images exist) */}
        {uniqueImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow hover:bg-white hover:scale-105 transition-all cursor-pointer dark:bg-neutral-900/80 dark:text-white dark:hover:bg-neutral-900"
              title="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow hover:bg-white hover:scale-105 transition-all cursor-pointer dark:bg-neutral-900/80 dark:text-white dark:hover:bg-neutral-900"
              title="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Photo counter badge */}
        <div className="absolute left-4 bottom-4 rounded-full bg-slate-900/70 px-3.5 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-sm">
          {activeIdx + 1} / {uniqueImages.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {uniqueImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {uniqueImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIdx(idx);
                setZoomScale(1);
              }}
              className={`snap-start relative h-16 w-24 sm:h-20 sm:w-28 flex-shrink-0 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                activeIdx === idx
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-95'
                  : 'border-slate-100 hover:border-indigo-400 dark:border-neutral-800'
              }`}
            >
              <img
                src={img}
                alt={`${title} Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute inset-0 transition-opacity ${activeIdx === idx ? 'bg-indigo-600/5' : 'bg-black/10 group-hover:bg-black/0'}`} />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-4 md:p-6 backdrop-blur-md"
          >
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="text-xs font-semibold tracking-wide text-neutral-300 uppercase">
                {title} — Image {activeIdx + 1} of {uniqueImages.length}
              </div>
              <div className="flex items-center space-x-3">
                {/* Zoom In */}
                <button
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 3}
                  className="p-2 bg-neutral-900/80 hover:bg-neutral-800 disabled:opacity-40 rounded-full transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                {/* Zoom Out */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1}
                  className="p-2 bg-neutral-900/80 hover:bg-neutral-800 disabled:opacity-40 rounded-full transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                {/* Close */}
                <button
                  onClick={handleClose}
                  className="p-2 bg-neutral-900/80 hover:bg-rose-900/50 hover:text-rose-400 rounded-full transition-colors cursor-pointer ml-2"
                  title="Close Gallery (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Middle Container (Main Image with zooming) */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden select-none">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800"
                title="Previous (ArrowLeft)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Zoomable Image Container */}
              <motion.div
                key={activeIdx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: zoomScale, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="max-h-[70vh] max-w-[85vw] flex items-center justify-center transition-transform cursor-grab active:cursor-grabbing"
              >
                <img
                  src={uniqueImages[activeIdx]}
                  alt={`${title} Fullsize`}
                  className="max-h-[70vh] max-w-[85vw] object-contain rounded-lg shadow-2xl pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800"
                title="Next (ArrowRight)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Bar: Mini Thumbnails in Lightbox */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="flex gap-2 overflow-x-auto max-w-[80vw] pb-2 scrollbar-none">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveIdx(idx);
                      setZoomScale(1);
                    }}
                    className={`h-10 w-16 sm:h-12 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      activeIdx === idx
                        ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Lightbox thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
