import {
  NotionStatusLink,
  Sprint,
  SprintHistory,
  SprintStatusHistory,
} from '@prisma/client';
import dayjs from 'dayjs';

export enum DataPlotLine {
  SCOPE = 'Scope',
  POINTS_LEFT = 'Done',
  POINTS_NOT_STARTED = 'In Progress',
  POINTS_DONE_INC_VALIDATE = 'To Validate',
}

export type DataPlotType = {
  time: number;
} & {
  [key in DataPlotLine]: number;
};

export type SprintHistoryWithStatusHistory = SprintHistory & {
  sprintStatusHistory: SprintStatusHistory[];
};

export const getDaysArray = function (start: Date, end: Date): Date[] {
  const s = new Date(start);
  const e = new Date(end);
  const a: Date[] = [];
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    a.push(new Date(d));
  }
  return a;
};

export const getDataForSprintChart = (
  sprint: Sprint,
  sprintHistory: SprintHistoryWithStatusHistory[],
  notionStatusLinks: NotionStatusLink[]
) => {
  const plotData: DataPlotType[] = sprintHistory
    .map((historyEvent) => {
      const scope = historyEvent.sprintStatusHistory.reduce((acc, history) => {
        acc += history.pointsInStatus;
        return acc;
      }, 0);

      // Count points which are in BacklogStatus.DONE
      const pointsDone = historyEvent.sprintStatusHistory.reduce(
        (acc, history) => {
          const notionStatusLink = notionStatusLinks.find(
            (status) => status.id === history.notionStatusLinkId
          );

          if (notionStatusLink?.status === 'DONE') {
            acc += history.pointsInStatus;
          }

          return acc;
        },
        0
      );

      const pointsDoneIncludingDoing = historyEvent.sprintStatusHistory.reduce(
        (acc, history) => {
          const notionStatusLink = notionStatusLinks.find(
            (status) => status.id === history.notionStatusLinkId
          );

          if (
            notionStatusLink?.status === 'DONE' ||
            notionStatusLink?.status === 'IN_PROGRESS'
          ) {
            acc += history.pointsInStatus;
          }

          return acc;
        },
        0
      );

      const pointsDoneIncludingToValidate =
        historyEvent.sprintStatusHistory.reduce((acc, history) => {
          const notionStatusLink = notionStatusLinks.find(
            (status) => status.id === history.notionStatusLinkId
          );

          if (
            notionStatusLink?.status === 'DONE' ||
            notionStatusLink?.notionStatusName === 'TO VALIDATE'
          ) {
            acc += history.pointsInStatus;
          }

          return acc;
        }, 0);

      const pointsLeft = scope - pointsDone;
      const pointsLeftExDoing = scope - pointsDoneIncludingDoing;
      const pointsLeftExToValidate = scope - pointsDoneIncludingToValidate;

      return {
        time: dayjs(historyEvent.timestamp).unix(),
        [DataPlotLine.SCOPE]: scope,
        [DataPlotLine.POINTS_LEFT]: pointsLeft,
        [DataPlotLine.POINTS_NOT_STARTED]: pointsLeftExDoing,
        [DataPlotLine.POINTS_DONE_INC_VALIDATE]: pointsLeftExToValidate,
      };
    })
    .sort((a, b) => a.time - b.time);

  return plotData;
};
