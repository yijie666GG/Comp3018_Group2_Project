import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from './firebase';

function sortFinancialYears(years) {
  return [...new Set(years)].sort((a, b) => {
    const startA = parseInt(a.split(/[–-]/)[0], 10);
    const startB = parseInt(b.split(/[–-]/)[0], 10);

    return startA - startB;
  });
}

export function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  return month >= 6
    ? `${year}–${year + 1}`
    : `${year - 1}–${year}`;
}

export async function getFinancialYearSettings() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user.');
  }

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const currentYear = getCurrentFinancialYear();

  if (!snapshot.exists()) {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        financialYears: [currentYear],
        activeFinancialYear: currentYear,
      },
      { merge: true }
    );

    return {
      financialYears: [currentYear],
      activeFinancialYear: currentYear,
    };
  }

  const data = snapshot.data();

  const financialYears = sortFinancialYears(
    data.financialYears?.length > 0
      ? data.financialYears
      : [currentYear]
  );

  const activeFinancialYear =
    data.activeFinancialYear || currentYear;

  await setDoc(
    userRef,
    {
      financialYears,
      activeFinancialYear,
    },
    { merge: true }
  );

  return {
    financialYears,
    activeFinancialYear,
  };
}

export async function addFinancialYear(year) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user.');
  }

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const existingYears = snapshot.exists()
    ? snapshot.data().financialYears || []
    : [];

  const financialYears = sortFinancialYears([
    ...existingYears,
    year,
  ]);

  await setDoc(
    userRef,
    {
      financialYears,
    },
    { merge: true }
  );
}

export async function setActiveFinancialYear(year) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user.');
  }

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const existingYears = snapshot.exists()
    ? snapshot.data().financialYears || []
    : [];

  const financialYears = sortFinancialYears([
    ...existingYears,
    year,
  ]);

  await setDoc(
    userRef,
    {
      financialYears,
      activeFinancialYear: year,
    },
    { merge: true }
  );
}