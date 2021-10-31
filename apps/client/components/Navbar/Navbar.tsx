import { gql } from '@apollo/client';
import { Loading } from 'components/Animate/Loading/Loading';
import { Clickable } from 'components/UI/Clickable/Clickable';
import { Dropdown } from 'components/UI/Dropdown/Dropdown';
import { useSyncContext } from 'context/syncContext';
import { useGetPathQuery } from 'generated';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { useContext } from 'react';
import { FiChevronRight, FiMoreHorizontal, FiTrash } from 'react-icons/fi';

gql`
  query GetPath($fromBlockId: ID!) {
    path(blockId: $fromBlockId) {
      id
      ... on PageBlock {
        title
        emoji
        description
      }
    }
  }
`;

export const Navbar: React.FunctionComponent = () => {
  const {
    query: { page },
  } = useRouter();

  const { isSyncing } = useSyncContext();

  if (!page) {
    return null;
  }

  const { data, loading } = useGetPathQuery({
    variables: { fromBlockId: page as string },
  });

  if (loading || !data) {
    return null;
  }

  const path = data.path.slice().reverse();

  return (
    <nav id="navbar" className="p-2 flex flex-row  justify-between ">
      <div className="flex flex-row items-center">
        {path.map((block, index) => {
          if (block.__typename === 'PageBlock') {
            return (
              <div key={block.id} className="flex flex-row items-center">
                <Link href={`/page/${block.id}`}>
                  <Clickable>
                    <p className="mx-0.5 text-gray-700 text-sm ">
                      {block.emoji}
                      <span className="ml-2">{block.title}</span>
                    </p>
                  </Clickable>
                </Link>
                {index < path.length - 1 && (
                  <div className="text-gray-700 text-sm ">
                    <FiChevronRight />
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
      <div className="flex flex-row items-center">
        {isSyncing && <Loading className="text-gray-600 h-3" />}
        <Dropdown
          button={
            <Clickable>
              <FiMoreHorizontal />
            </Clickable>
          }
          showDirection="right"
          items={[[{ text: 'Delete', logo: <FiTrash /> }]]}
        />
      </div>
    </nav>
  );
};
