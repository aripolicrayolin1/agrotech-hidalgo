'use client';

import React, { ReactNode } from 'react';
import { auth, db, app } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const FirebaseClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <FirebaseProvider firebaseApp={app} firestore={db} auth={auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
