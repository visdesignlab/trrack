/* eslint-disable no-unused-vars */

import { ProvenanceGraph } from './ProvenanceGraph';

export type ChangeType = 'CurrentChanged' | 'NodeAdded' | 'Any';

export type GlobalObserver<S, A> = (graph?: ProvenanceGraph<S, A>, changeType?: ChangeType) => void;

export type ObserverExpression<T, P> = (state: T) => P;

export type ObserverEffect<P> = (state?: P, previousState?: P) => void;
