import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { NodeID } from '@visdesignlab/trrack';

export function AnnotationButton<S extends string, A>({
  onClick,
  isAnnotating,
  color,
}: {
  onClick: () => void;
  isAnnotating: boolean;
  color: string;
}) {
  const [isHover, setHover] = useState<boolean>(false);
  return (
    <div
      style={{
        marginRight: '5px',
        color: isAnnotating || isHover ? color : 'lightgray',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <FontAwesomeIcon icon={faEdit} />
    </div>
  );
}
