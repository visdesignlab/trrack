/* eslint-disable no-unused-vars */

import { ProvenanceGraph } from './ProvenanceGraph';

export type GlobalObserver<T, S, A> = (
  graph?: ProvenanceGraph<T, S, A>
) => void;

export type ObserverExpression<T> = (state: T) => any;

export type ObserverEffect<T> = (data?: T) => void;
