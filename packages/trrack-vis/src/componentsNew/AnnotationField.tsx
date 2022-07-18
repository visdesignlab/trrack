import React from 'react';
import { ProvVisConfig } from './ProvVis';

import {
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { isChildNode, ProvenanceNode } from '@visdesignlab/trrack';

export function AnnotationField<S extends string, A>({
  config,
  node,
  setAnnotationDepth,
}: {
  config: ProvVisConfig<S, A>;
  node: ProvenanceNode<S, A>;
  setAnnotationDepth: (depth: number | null) => void;
}) {
  const [value, setValue] = React.useState(
    isChildNode(node)
      ? node.artifacts.annotations[node.artifacts.annotations.length - 1]
          ?.annotation
      : 'Test'
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Card>
      <CardContent>
        <TextField
          fullWidth={true}
          multiline={true}
          label="Annotation"
          inputProps={{
            style: {
              fontSize: '12px',
            },
          }}
          value={value}
          onChange={handleChange}
        />
      </CardContent>
      <CardActions>
        <div style={{ display: 'flex' }}>
          <Button onClick={() => setAnnotationDepth(null)}>Close</Button>
          <Button
            onClick={() => {
              setAnnotationDepth(null);
              config.annotateNode(node.id, value);
            }}
          >
            Annotate
          </Button>
        </div>
      </CardActions>
    </Card>
  );
}
