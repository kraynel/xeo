import { ExternalLinkIcon } from '@heroicons/react/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { GetSprintColumnPlotData } from 'pages/api/team/[teamId]/sprint/[sprintId]/column-plot-data';
import { useCallback, useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { SprintStats } from './SprintStats/SprintStats';
import axios from 'axios';
import { PostUpdateSprintHistory } from 'pages/api/team/[teamId]/sprint/[sprintId]/update-history';
import { ScopedMutator } from 'swr/dist/types';
import { toast } from 'react-toastify';
import { UserAction, trackSprintAction } from 'utils/analytics';
import { NextSeo } from 'next-seo';
import Skeleton from 'react-loading-skeleton';
import { GraphControls } from './GraphControls/GraphControls';
import classNames from 'classnames';
import Button, { ButtonVariation } from '@xeo/ui/lib/Button/Button';
import { SprintGraphDynamic } from './SprintGraph/SprintGraphDynamic';
import { DataPlotType } from 'utils/sprint/chart';
import { Sprint } from '@prisma/client';
import { useCurrentTeam } from 'hooks/useCurrentTeam';

dayjs.extend(relativeTime);

interface Props {
  sprint: Sprint;
  plotData: DataPlotType[];
  publicMode: boolean;
  sprintId: string;
}

const updateSprintHistory = async ({
  sprintId,
  teamId,
  mutate,
}: {
  sprintId: string;
  teamId: string;
  mutate: ScopedMutator<unknown>;
}) => {
  const body: PostUpdateSprintHistory['request'] = { sprintId };

  try {
    const { data } = await axios.post<PostUpdateSprintHistory['response']>(
      `/api/team/${teamId}/sprint/${sprintId}/update-history`,
      body
    );

    if (data.updatedSprintPlotData) {
      mutate(`/api/team/${teamId}/sprint/${sprintId}/column-plot-data`);
    }
  } catch (error) {
    toast.error('Error fetching latest Sprint history, please try again later');
  }
};

export const SprintInfo: React.FunctionComponent<Props> = ({
  sprint,
  plotData,
  publicMode,
  sprintId,
}) => {
  useEffect(() => {
    trackSprintAction({
      action: UserAction.SPRINT_VIEW,
      sprintId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const { team } = useCurrentTeam();

  const { mutate } = useSWRConfig();

  const handleUpdateSprintHistory = useCallback(async () => {
    if (sprint && team) {
      if (!dayjs(sprint.endDate).isBefore(dayjs(), 'minute')) {
        setIsLoading(true);
        await updateSprintHistory({
          sprintId: sprint.id,
          teamId: team?.id,
          mutate,
        });
        setIsLoading(false);
      } else {
        toast.warn("You can't update a sprint that's in the past!");
      }
    }
  }, [plotData, mutate, team]);

  const [showPointsNotStarted, setShowPointsNotStarted] = useState(true);

  return (
    <div className={classNames('w-full')}>
      <NextSeo
        title={`Sprint - ${sprint?.name}`}
        description={`View ${sprint?.name}`}
      />

      <div className="flex flex-row justify-between">
        <div>
          <h2 className="my-0">{sprint?.name ?? <Skeleton width={160} />}</h2>
          <p>{sprint?.sprintGoal ?? <Skeleton width={'70%'} count={1} />}</p>
        </div>
        <div>
          <Button
            href={`/team/${team?.id}/sprint/${sprint.id}/edit`}
            variation={ButtonVariation.Dark}
          >
            Edit
          </Button>
        </div>
      </div>
      <SprintStats sprintHistoryPlotData={plotData} sprintId={sprintId} />

      <GraphControls
        publicMode={publicMode}
        isLoading={isLoading}
        setShowPointsNotStarted={setShowPointsNotStarted}
        showPointsNotStarted={showPointsNotStarted}
        handleUpdateSprintHistory={handleUpdateSprintHistory}
      />
      <SprintGraphDynamic
        sprint={sprint}
        plotData={plotData}
        showPointsNotStarted={showPointsNotStarted}
      />
      {/* {publicMode ? null : (
        <FeatureToggle>
          <SprintHistory sprintId={sprintId} />
        </FeatureToggle>
      )} */}
    </div>
  );
};
