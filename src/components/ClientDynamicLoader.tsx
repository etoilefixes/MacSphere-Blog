
'use client';

import dynamic from 'next/dynamic';

const FooterContent = dynamic(() => import('@/components/FooterContent').then(mod => mod.FooterContent), { ssr: false });
const BackToTopButton = dynamic(() => import('@/components/BackToTopButton').then(mod => mod.BackToTopButton), { ssr: false });

export function ClientDynamicLoader() {
  return (
    <>
      <FooterContent />
      <BackToTopButton />
    </>
  );
}
