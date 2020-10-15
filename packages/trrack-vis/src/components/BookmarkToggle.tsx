import { ProvenanceGraph } from '@visdesignlab/trrack';

import React from 'react';

export interface BookmarkToggleConfig<T, S extends string, A> {
  graph?: ProvenanceGraph<T, S, A>;
  bookmarkView: boolean;
  // eslint-disable-next-line no-unused-vars
  setBookmarkView: (b: boolean) => void;
}

function BookmarkToggle<T, S extends string, A>({
  graph,
  bookmarkView,
  setBookmarkView,
} : BookmarkToggleConfig<T, S, A>) {
  if (graph === undefined) {
    return null;
  }

  return (

    <div className='custom-control custom-switch'>
      <input
        type='checkbox'
        className='custom-control-input'
        id='customSwitches'
        checked={bookmarkView}
        onChange= {() => { setBookmarkView(!bookmarkView); }}
        readOnly
      />
      <label className='custom-control-label' htmlFor='customSwitches'>
         Show bookmarked
      </label>
    </div>

  );
}

export default BookmarkToggle;
