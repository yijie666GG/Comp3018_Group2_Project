import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";

import { auth, db } from "./firebase";

/* ======================================================
   GET CURRENT FINANCIAL YEAR
====================================================== */

export function getCurrentFinancialYear() {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  /*
    Australian financial year:
    1 July -> 30 June

    Examples:

    August 2026
    = 2026-2027

    March 2026
    = 2025-2026
  */

  return month >= 6
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
}

/* ======================================================
   GET FINANCIAL YEAR SETTINGS
====================================================== */

export async function getFinancialYearSettings() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  const snapshot =
    await getDoc(userRef);

  const currentYear =
    getCurrentFinancialYear();

  /* ------------------------------------------
     USER DOCUMENT DOES NOT EXIST
  ------------------------------------------ */

  if (!snapshot.exists()) {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        financialYears: [
          currentYear,
        ],
        activeFinancialYear:
          currentYear,
      },
      {
        merge: true,
      }
    );

    return {
      financialYears: [
        currentYear,
      ],
      activeFinancialYear:
        currentYear,
    };
  }

  /* ------------------------------------------
     USER DOCUMENT EXISTS
  ------------------------------------------ */

  const data =
    snapshot.data();

  /*
    Get saved financial years.

    Also convert an old en dash:

    2025–2026

    into:

    2025-2026
  */

  const savedYears =
    Array.isArray(
      data.financialYears
    )
      ? data.financialYears
          .map((year) =>
            String(year)
              .replace(
                /[–—]/g,
                "-"
              )
              .trim()
          )
          .filter(Boolean)
      : [];

  /*
    If no financial years exist,
    create the current financial year.
  */

  const financialYears =
    savedYears.length > 0
      ? [
          ...new Set([
            ...savedYears,
          ]),
        ]
      : [currentYear];

  /*
    Get active financial year
    and normalise it.
  */

  let activeFinancialYear =
    data.activeFinancialYear
      ? String(
          data.activeFinancialYear
        )
          .replace(
            /[–—]/g,
            "-"
          )
          .trim()
      : currentYear;

  /*
    Make sure the active financial
    year exists in the list.
  */

  if (
    !financialYears.includes(
      activeFinancialYear
    )
  ) {
    activeFinancialYear =
      financialYears[0];
  }

  /*
    Save the cleaned values back
    to Firebase.
  */

  await setDoc(
    userRef,
    {
      financialYears,
      activeFinancialYear,
    },
    {
      merge: true,
    }
  );

  return {
    financialYears,
    activeFinancialYear,
  };
}

/* ======================================================
   ADD FINANCIAL YEAR
====================================================== */

export async function addFinancialYear(
  year
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  /*
    Normalise the year.

    Example:

    2027–2028
    becomes
    2027-2028
  */

  const normalisedYear =
    String(year)
      .replace(
        /[–—]/g,
        "-"
      )
      .trim();

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  await setDoc(
    userRef,
    {
      financialYears:
        arrayUnion(
          normalisedYear
        ),
    },
    {
      merge: true,
    }
  );
}

/* ======================================================
   SET ACTIVE FINANCIAL YEAR
====================================================== */

export async function setActiveFinancialYear(
  year
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "No authenticated user."
    );
  }

  const normalisedYear =
    String(year)
      .replace(
        /[–—]/g,
        "-"
      )
      .trim();

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  await setDoc(
    userRef,
    {
      financialYears:
        arrayUnion(
          normalisedYear
        ),
      activeFinancialYear:
        normalisedYear,
    },
    {
      merge: true,
    }
  );
}