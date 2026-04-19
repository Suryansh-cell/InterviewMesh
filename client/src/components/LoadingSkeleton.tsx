import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-center">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-3 w-1/2 mx-auto" />
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
