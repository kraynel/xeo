import { BlockHandle } from './BlockHandle/BlockHandle';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { DynamicBlockRenderer } from './DynamicBlock/DynamicBlockRenderer';
import { PageBlockFragment } from 'generated';

interface Props {
  block: PageBlockFragment;
  dragHandleProps: DraggableProvidedDragHandleProps | undefined;
}

export const ContentBlock: React.FunctionComponent<Props> = ({
  dragHandleProps,
  block,
}) => {
  return (
    <BlockHandle dragHandleProps={dragHandleProps} block={block}>
      <DynamicBlockRenderer block={block} />
    </BlockHandle>
  );
};