import { Team } from '@prisma/client';
import Joi from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  apiError,
  APIGetRequest,
  APIRequest,
  apiResponse,
  parseAPIRequest,
} from 'utils/api';
import {
  createTeam,
  CreateTeam,
  getTeamsForUser,
  TeamWithMemberAndBasicUserInfo,
} from 'utils/db/team/adapter';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

export type CreateTeamRequest = APIRequest<
  { input: CreateTeam },
  { team: Team }
>;

export type GetTeamsForUserRequest = APIGetRequest<{
  teams: TeamWithMemberAndBasicUserInfo[];
}>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return apiError(res, { message: 'Not authenticated' }, 401);
  }

  switch (req.method) {
    case 'POST':
      return postHandler(req, res, session.id);
    case 'GET':
      return getHandler(req, res, session.id);
    default:
      return apiError(res, { message: 'Method not allowed' }, 405);
  }
};

const postSchema: CreateTeamRequest['joiBodySchema'] = Joi.object({
  input: Joi.object({
    name: Joi.string().required(),
    shortName: Joi.string().required(),
    companyName: Joi.string().required(),
  }).required(),
});

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const { body, error } = parseAPIRequest(req, postSchema);

  if (error) {
    return apiError(res, error);
  }

  const team = await createTeam(userId, body.input);

  if (!team) {
    return apiError(res, { message: 'Issue creating team' }, 500);
  }

  return apiResponse<CreateTeamRequest>(res, { team: team }, 201);
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teams = await getTeamsForUser(userId);

  return apiResponse<GetTeamsForUserRequest>(res, { teams: teams });
};

export default handler;
