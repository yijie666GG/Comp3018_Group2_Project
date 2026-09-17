import {
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';

import { auth, db } from './firebase';

export async function getPersonalInformation() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No authenticated user.');
    }

    const userRef = doc(
        db,
        'users',
        user.uid
    );

    const snapshot = await getDoc(userRef);

    const data = snapshot.exists()
        ? snapshot.data()
        : {};

    return {
        name: data.name || '',
        email: data.email || user.email || '',
    };
}

export async function savePersonalInformation(name) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No authenticated user.');
    }

    const userRef = doc(
        db,
        'users',
        user.uid
    );

    await setDoc(
        userRef,
        {
            uid: user.uid,
            name: name.trim(),
            email: user.email || '',
        },
        {
            merge: true,
        }
    );
}