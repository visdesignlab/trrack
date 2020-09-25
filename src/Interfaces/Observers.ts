export type GlobalObserver<T, S, A> = (graph?: ProvenanceGraph<T, S, A>) => void;
export type Observer<T> = (data: T) => void;
