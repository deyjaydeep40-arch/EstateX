/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SkeletonProps {
  count?: number;
  className?: string;
}

export const CardSkeleton: React.FC<SkeletonProps> = ({ count = 3, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className={`flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white p-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
        >
          {/* Thumbnail */}
          <div className="aspect-[4/3] w-full animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          
          {/* Details */}
          <div className="p-4 space-y-3.5">
            <div className="flex justify-between items-center">
              <div className="h-6 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            
            <div className="h-5 w-4/5 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-3.5 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            
            {/* Stats bar */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-50 dark:border-neutral-800">
              <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* breadcrumb */}
      <div className="h-4 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
      
      {/* Title & Location block */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-8 w-2/3 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-8 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800 self-start" />
      </div>

      {/* Image Gallery grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px] md:h-[450px]">
        <div className="md:col-span-2 h-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="flex-1 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex-1 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="flex-1 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex-1 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>

      {/* Description / Contact Pane Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-14 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
        <div className="h-[380px] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
};
