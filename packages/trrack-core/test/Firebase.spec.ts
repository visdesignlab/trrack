import { initializeFirebase } from '../src/Provenance/FirebaseFunctions';

const firebaseConfig = {
  apiKey: 'AIzaSyDDSC6jbcXkv5zcB-SGGTMYVryYo4q_0JI',
  authDomain: 'trrack-testing.firebaseapp.com',
  databaseURL: 'https://trrack-testing.firebaseio.com',
  projectId: 'trrack-testing',
  storageBucket: 'trrack-testing.appspot.com',
  messagingSenderId: '39631851502',
  appId: '1:39631851502:web:9da7375282f0b27e1b48ff',
};

describe('Test', () => {
  it('works', () => {
    const { db } = initializeFirebase(firebaseConfig);
    const ref = db.ref();
    ref.on('value', (snap) => {
      console.log(snap.val());
    });
  });
});
