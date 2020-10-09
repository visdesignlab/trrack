
import { ProvenanceGraph } from '@visdesignlab/trrack';

import React, {Component} from 'react';
import { style } from 'typestyle';

export interface BookmarkToggleConfig<T, S extends string, A> {
  graph?: ProvenanceGraph<T, S, A>;
  bookmarkView: boolean;
  setBookmarkView: (b: boolean) => void;

}

function  BookmarkToggle<T, S extends string, A>({
  graph,
  bookmarkView,
  setBookmarkView
} : BookmarkToggleConfig<T, S, A> ) {

  if(graph === undefined)
  {
    return null;
  }


  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  let margin = {
    marginRight: "1px"
  } as React.CSSProperties

  return (

    <div className='custom-control custom-switch'>
       <input
         type='checkbox'
         className='custom-control-input'
         id='customSwitches'
         checked={bookmarkView}
         onChange= {(e) => {setBookmarkView(!bookmarkView)}}
         readOnly
       />
       <label className='custom-control-label' htmlFor='customSwitches'>
         Show bookmarked
       </label>
     </div>


 );
}



const marginRight = style({
  marginRight:"1px",

});


export default BookmarkToggle;
