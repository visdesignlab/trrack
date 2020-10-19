import { initProvenance, createAction } from '../src';

type State = {
  userName: string;
  userDetails: {
    address: {
      state: string;
      country: string;
    };
    email: string;
  };
};

const initialState: State = {
  userName: 'Kiran',
  userDetails: {
    email: 'abc@abc.com',
    address: {
      state: 'UT',
      country: 'US',
    },
  },
};

type Events =
  | 'ChangeName'
  | 'ChangeEmail'
  | 'ChangeAddress'
  | 'ChangeState'
  | 'ChangeCountry';

let nameChanged: number = 0;
let globalChanged: number = 0;
let userDetailsChanged: number = 0;
let emailChanged: number = 0;
let addressChanged: number = 0;
let stateChanged: number = 0;
let countryChanged: number = 0;

function resetCounters() {
  nameChanged = 0;
  globalChanged = 0;
  userDetailsChanged = 0;
  emailChanged = 0;
  addressChanged = 0;
  stateChanged = 0;
  countryChanged = 0;
}

function setup() {
  resetCounters();
  const provenance = initProvenance<State, Events>(initialState);

  const changeName = createAction<State, [string], Events>(
    (state, name: string) => {
      state.userName = name;
    },
  )
    .setLabel('Changing Name')
    .setLabel('ChangeName');
  const changeEmail = createAction<State, [string], Events>(
    (state, email: string) => {
      state.userDetails.email = email;
    },
  )
    .setLabel('Changing Email')
    .setEventType('ChangeEmail');
  const changeAddress = createAction<State, [string, string], Events>(
    (state, st: string, country: string) => {
      state.userDetails.address.state = st;
      state.userDetails.address.country = country;
    },
  )
    .setLabel('Changing Address')
    .setEventType('ChangeAddress');
  const changeStateName = createAction<State, [string], Events>(
    (state, stateName: string) => {
      state.userDetails.address.state = stateName;
    },
  )
    .setLabel('Changing State')
    .setEventType('ChangeState');
  const changeCountry = createAction<State, [string], Events>(
    (state, country: string) => {
      state.userDetails.address.country = country;
    },
  )
    .setLabel('Changing Country')
    .setEventType('ChangeCountry');

  provenance.addGlobalObserver(() => {
    globalChanged += 1;
  });

  provenance.addObserver(
    (state) => state.userName,
    () => {
      nameChanged += 1;
    },
  );

  provenance.addObserver(
    (state) => state.userDetails,
    () => {
      userDetailsChanged += 1;
    },
  );

  provenance.addObserver(
    (state) => state.userDetails.email,
    () => {
      emailChanged += 1;
    },
  );

  provenance.addObserver(
    (state) => state.userDetails.address,
    () => {
      addressChanged += 1;
    },
  );
  provenance.addObserver(
    (state) => state.userDetails.address.state,
    () => {
      stateChanged += 1;
    },
  );
  provenance.addObserver(
    (state) => state.userDetails.address.country,
    () => {
      countryChanged += 1;
    },
  );

  provenance.done();

  return {
    provenance,
    changeName,
    changeEmail,
    changeAddress,
    changeStateName,
    changeCountry,
  };
}

describe('addGlobalObserver & addObserver', () => {
  it('global observer and userName change observer work correctly', () => {
    const { provenance, changeName } = setup();

    provenance.apply(changeName('Test'));

    expect(nameChanged).toEqual(1);
    expect(globalChanged).toEqual(1);
  });

  it('global observer, email change change observer works correctly', () => {
    const { provenance, changeEmail } = setup();

    provenance.apply(changeEmail('123@abc.com'));

    expect(emailChanged).toEqual(1);
    expect(globalChanged).toEqual(1);
    expect(userDetailsChanged).toEqual(1);
  });

  it('global observer, userDetails change, email change observer works correctly when changing email', () => {
    const { provenance, changeEmail } = setup();

    provenance.apply(changeEmail('123@abc.com'));

    expect(emailChanged).toEqual(1);
    expect(globalChanged).toEqual(1);
    expect(userDetailsChanged).toEqual(1);
  });

  it('global observer, userDetails change, address change observer works correctly when changing state', () => {
    const { provenance, changeStateName } = setup();

    provenance.apply(changeStateName('AZ'));

    expect(stateChanged).toEqual(1);
    expect(globalChanged).toEqual(1);
    expect(userDetailsChanged).toEqual(1);
    expect(addressChanged).toEqual(1);
    expect(countryChanged).toEqual(0);
  });

  it('global observer, userDetails change, address change observer works correctly when changing country', () => {
    const { provenance, changeCountry } = setup();

    provenance.apply(changeCountry('USA'));

    expect(countryChanged).toEqual(1);
    expect(stateChanged).toEqual(0);
    expect(globalChanged).toEqual(1);
    expect(userDetailsChanged).toEqual(1);
    expect(addressChanged).toEqual(1);
  });

  it('global observer, userDetails change, address change observer works correctly when changing address object', () => {
    const { provenance, changeAddress } = setup();

    provenance.apply(changeAddress('AZ', 'USA'));

    expect(countryChanged).toEqual(1);
    expect(stateChanged).toEqual(1);
    expect(globalChanged).toEqual(1);
    expect(userDetailsChanged).toEqual(1);
    expect(addressChanged).toEqual(1);
  });

  it('global observer, userDetails change, address change, stateChange, country change observer works correctly when changing state and country separately', () => {
    const { provenance, changeStateName, changeCountry } = setup();

    provenance.apply(changeStateName('AZ'));
    provenance.apply(changeCountry('USA'));

    expect(countryChanged).toEqual(1);
    expect(stateChanged).toEqual(1);
    expect(globalChanged).toEqual(2);
    expect(userDetailsChanged).toEqual(2);
    expect(addressChanged).toEqual(2);
  });
});
