import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

export async function getNotificationPreference() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No authenticated user.');
    }

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        return true;
    }

    const data = snapshot.data();

    if (typeof data.financialYearReminder === 'boolean') {
        return data.financialYearReminder;
    }

    return true;
}

export async function setNotificationPreference(value) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No authenticated user.');
    }

    const userRef = doc(db, 'users', user.uid);

    await setDoc(
        userRef,
        {
            financialYearReminder: value,
        },
        {
            merge: true,
        }
    );
}