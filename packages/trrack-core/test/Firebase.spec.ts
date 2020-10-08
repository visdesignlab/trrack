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

const { db } = initializeFirebase(firebaseConfig);

describe('Test', () => {
  it('works', () => {
    db.ref('test/hello')
      .set('World')
      .then((d) => console.log(d))
      .catch((err) => {
        console.error(err);
        throw new Error(err);
      });

    db.ref()
      .once('value')
      .then((d) => console.log(d.val()))
      .catch((err) => console.error(err));
  });
});
